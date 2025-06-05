import { execa } from "execa";
import os from "node:os";
import path from "node:path";
import { logger } from "./logger";

export const showCalculationResultDialog = async (
  query: string,
  result: string
) => {
  const cwd = path.join(os.homedir(), "Tools", "quickulator", "app");
  const target = path.join(cwd, "dist", "quickulator");

  try {
    await execa(target, [query], { cwd, preferLocal: true });
  } catch (error) {
    logger.error(`Failed to show calculation result`, error);
  }
};
