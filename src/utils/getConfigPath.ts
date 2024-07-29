import * as path from "node:path";
import { getConfigDir } from "./getConfigDir";

export const getConfigPath = (filename: string) =>
  path.join(getConfigDir(), filename);
