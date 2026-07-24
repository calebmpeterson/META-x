import { execa } from "execa";
import {
  AlertToolInvocation,
  DisplayToolInvocation,
  FileToolInvocation,
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

const isFileToolInvocation = (
  invocation: ToolInvocation,
): invocation is FileToolInvocation => {
  return invocation.tool === "file.tool";
};

const isAlertToolInvocation = (
  invocation: ToolInvocation,
): invocation is AlertToolInvocation => {
  return invocation.tool === "alert.tool";
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
    } else if (isFileToolInvocation(invocation)) {
      const { stdout, exitCode } = await execa(
        toolExecutable,
        [
          "--mode",
          invocation.mode,
          "--title",
          invocation.title,
          "--directory",
          invocation.directory,
        ],
        { reject: false },
      );
      if (exitCode !== 0 || !stdout.trim()) {
        return undefined;
      }
      return { path: stdout.trim() };
    } else if (isAlertToolInvocation(invocation)) {
      const { stdout, exitCode } = await execa(
        toolExecutable,
        [
          "--title",
          invocation.title,
          "--text",
          invocation.text,
          "--button1",
          invocation.button1,
          "--button2",
          invocation.button2,
        ],
        { reject: false },
      );
      if (exitCode !== 0 || !stdout.trim()) {
        return undefined;
      }
      return { button: stdout.trim() };
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
