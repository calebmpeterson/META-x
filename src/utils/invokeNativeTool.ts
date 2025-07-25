import { execa } from "execa";
import { DisplayToolInvocation, ToolInvocation } from "../types";
import _ from "lodash";
import { logger } from "./logger";
import path from "path";

const isDisplayToolInvocation = (
  invocation: ToolInvocation
): invocation is DisplayToolInvocation => {
  return invocation.tool === "display.tool";
};

export const invokeNativeTool = async (invocation: ToolInvocation) => {
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
