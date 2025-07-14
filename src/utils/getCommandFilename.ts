import path from "node:path";
import { SCRIPTS_DIR } from "./getConfigDir";

export const getCommandFilename = (commandFilename: string) =>
  path.join(SCRIPTS_DIR, commandFilename);
