import fs from "fs";
import path from "path";
import _ from "lodash";
import { createRequire } from "module";
import { getBuiltInCommands } from "../catalog/built-ins.mjs";
import { getFolders } from "../catalog/folders.mjs";
import { getApplications } from "../catalog/applications.mjs";
import { getSystemPreferences } from "../catalog/system-preferences.mjs";
import { getSystemCommands } from "../catalog/system.mjs";
import { getConfigDir } from "./getConfigDir.mjs";

const getCommands = () =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `⌁ ${path.basename(command, ".js")}`,
      value: command,
    }));

const getCommandFilename = (commandFilename) =>
  path.join(getConfigDir(), commandFilename);

const getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename("fallback-handler.js");
  try {
    const require = createRequire(import.meta.url);
    const fallbackHandler = require(commandFilename);

    const fallbackCommands =
      fallbackHandler.suggestions && fallbackHandler.suggestions.call();

    return fallbackCommands.map((fallbackCommand) => ({
      label: fallbackCommand,
      title: fallbackCommand,
      value: fallbackCommand,
      isFallback: true,
    }));
  } catch (e) {
    console.error(`Failed to run fallback handler: ${e.message}`);
    return [];
  }
};

const commandComparator = ({ title }) => title;

const applicationComparator = ({ score }) => -score;

const getAllCommands = () => {
  try {
    console.time("getAllCommands");

    const allCommands = [
      ..._.sortBy(
        [...getCommands(), ...getBuiltInCommands()],
        commandComparator
      ),
      ...getFolders(),
      ...getSystemPreferences(),
      ...getSystemCommands(),
      ..._.chain([
        // Applications can live in multiple locations on macOS
        // Source: https://unix.stackexchange.com/a/583843
        ...getApplications("/Applications"),
        ...getApplications("/Applications/Utilities"),
        ...getApplications("/System/Applications"),
        ...getApplications("/System/Applications/Utilities"),
      ])
        .sortBy(commandComparator)
        .sortBy(applicationComparator)
        .value(),
      ...getCommandsFromFallbackHandler(),
    ];

    return allCommands;
  } finally {
    console.timeEnd("getAllCommands");
  }
};

export { getAllCommands, getCommandFilename };
