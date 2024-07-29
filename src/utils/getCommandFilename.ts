import path from "node:path";
import { getConfigDir } from "./getConfigDir";

export const getCommandFilename = (commandFilename: string) =>
  path.join(getConfigDir(), commandFilename);
