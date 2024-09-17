import os from "os";
import path from "path";

export const getConfigDir = (...subdirs: string[]) =>
  path.join(os.homedir(), ".meta-x", ...subdirs);
