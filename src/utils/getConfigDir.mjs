import os from "os";
import path from "path";

export const getConfigDir = () => path.join(os.homedir(), ".meta-x");
