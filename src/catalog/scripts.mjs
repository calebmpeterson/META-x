import fs from "fs";
import path from "path";
import { getConfigDir } from "../utils/getConfigDir.mjs";
import { SCRIPT_PREFIX } from "./_constants.mjs";

export const getScriptCommands = () =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `${SCRIPT_PREFIX} ${path.basename(command, ".js")}`,
      value: command,
    }));
