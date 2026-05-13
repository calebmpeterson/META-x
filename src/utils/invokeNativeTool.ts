import { execa } from "execa";
import {
  DisplayToolInvocation,
  PromptToolInvocation,
  ToolInvocation,
} from "../types";
import _ from "lodash";
import { logger } from "./logger";
import path from "path";

const isDisplayToolInvocation = (
  invocation: ToolInvocation,
): invocation is DisplayToolInvocation => {
  return invocation.tool === "display.tool";
};

const isPromptToolInvocation = (
  invocation: ToolInvocation,
): invocation is PromptToolInvocation => {
  return invocation.tool === "prompt.tool";
};

export const invokeNativeTool = async (
  invocation: ToolInvocation,
): Promise<Record<string, string> | undefined | void> => {
  const toolDirectory = path.join(process.cwd(), "bin", "tools");
  const toolExecutable = path.join(toolDirectory, invocation.tool);
  try {
    if (isDisplayToolInvocation(invocation)) {
      await execa(toolExecutable, [
        ...(invocation.timeout
          ? ["--timeout", String(invocation.timeout)]
          : []),
        invocation.message,
      ]);
    } else if (isPromptToolInvocation(invocation)) {
      const args = Object.entries(invocation.fields).flatMap(
        ([label, kind]) => [`--${kind}`, label],
      );
      const { stdout, exitCode } = await execa(toolExecutable, args, {
        reject: false,
      });
      if (exitCode !== 0 || !stdout.trim()) {
        return undefined;
      }
      return JSON.parse(stdout) as Record<string, string>;
    } else {
      await execa("shortcuts", ["run", invocation.tool]);
    }
  } catch (error: unknown) {
    if (_.isError(error)) {
      logger.error(`Failed to run tool: ${error.message}`);
    } else {
      logger.error(`Failed to run tool: ${invocation.tool}`);
    }
  }
};
