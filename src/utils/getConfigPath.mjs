import * as path from "node:path";
import { getConfigDir } from "./getConfigDir.mjs";

export const getConfigPath = (filename) => path.join(getConfigDir(), filename);
