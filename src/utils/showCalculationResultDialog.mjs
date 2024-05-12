import { execa } from "execa";
import os from "node:os";
import path from "node:path";

export const showCalculationResultDialog = async (query, result) => {
  const cwd = path.join(os.homedir(), "Tools", "quickulator", "app");
  const target = path.join(cwd, "dist", "quickulator");

  try {
    await execa(target, [...query], { cwd, preferLocal: true });
  } catch (error) {
    console.error(`Failed to show calculation result`, error);
  }
};
