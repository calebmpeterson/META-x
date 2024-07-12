import path from "path";
import _ from "lodash";
import { createRequire } from "module";
import { getBuiltInCommands } from "../catalog/built-ins.mjs";
import { getFolders } from "../catalog/folders.mjs";
import { getApplications } from "../catalog/applications.mjs";
import { getSystemPreferences } from "../catalog/system-preferences.mjs";
import { getSystemCommands } from "../catalog/system.mjs";
import { getConfigDir } from "./getConfigDir.mjs";
import { getManageScriptCommands } from "../catalog/manage-scripts.mjs";
import { getScriptCommands } from "../catalog/scripts.mjs";
import { getShortcuts } from "../catalog/shortcuts.mjs";
import { clock } from "./clock.mjs";

export const getCommandFilename = (commandFilename) =>
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

export const getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getFolders(),
    ...getShortcuts(),
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
    ...getSystemCommands(),
    ...getSystemPreferences(),
    ...getCommandsFromFallbackHandler(),
  ];

  return allCommands;
});
