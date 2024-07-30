import fs from "fs";
import path from "path";
import { getConfigDir } from "../utils/getConfigDir";
import { SCRIPT_PREFIX } from "./_constants";
import { ScriptCommand } from "./types";
import { getCommandFilename } from "../utils/getCommandFilename";
import { invokeScript } from "../utils/invokeScript";

export const getScriptCommands = (): ScriptCommand[] =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `${SCRIPT_PREFIX} ${path.basename(command, ".js")}`,
      invoke: async (selection: string) => {
        const commandFilename = getCommandFilename(command);

        return invokeScript(commandFilename, selection);
      },
    }));
