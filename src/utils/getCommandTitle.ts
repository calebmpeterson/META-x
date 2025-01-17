import { basename } from "node:path";

export const getCommandTitle = (commandFilename: string) =>
  basename(commandFilename, ".js");
