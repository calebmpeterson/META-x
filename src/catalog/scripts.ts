import fs from "fs";
import { getCommandFilename } from "../utils/getCommandFilename";
import { getCommandTitle } from "../utils/getCommandTitle";
import { SCRIPTS_DIR } from "../utils/getConfigDir";
import { invokeScript } from "../utils/invokeScript";
import { SCRIPT_PREFIX } from "./_constants";
import { ScriptCommand } from "./types";

export const getScriptCommands = (): ScriptCommand[] =>
  fs
    .readdirSync(SCRIPTS_DIR)
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `${SCRIPT_PREFIX} ${getCommandTitle(command)}`,
      invoke: async (selection: string) => {
        const commandFilename = getCommandFilename(command);

        return invokeScript(commandFilename, selection);
      },
    }));
