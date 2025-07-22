import _ from "lodash";
import { ApplicationLauncher, Command } from "../catalog/types";
import { clock } from "./clock";
import { createRequire } from "node:module";
import { getApplications } from "../catalog/applications";
import { getBuiltInCommands } from "../catalog/built-ins";
import { getCommandFilename } from "./getCommandFilename";
import { getFolders } from "../catalog/folders";
import { getManageCommands } from "../catalog/manage";
import { getManageScriptCommands } from "../catalog/manage-scripts";
import { getManageSnippetCommands } from "../catalog/manage-snippets";
import { getScriptCommands } from "../catalog/scripts";
import { getShortcuts } from "../catalog/shortcuts";
import { getSnippetCommands } from "../catalog/snippets";
import { getSystemCommands } from "../catalog/system";
import { getSystemPreferences } from "../catalog/system-preferences";
import { logger } from "./logger";

const getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename("fallback-handler.js");
  try {
    const require = createRequire(import.meta.url);
    const fallbackHandler = require(commandFilename);

    const fallbackCommands =
      fallbackHandler.suggestions && fallbackHandler.suggestions.call();

    return fallbackCommands.map((fallbackCommand: string) => ({
      label: fallbackCommand,
      title: fallbackCommand,
      value: fallbackCommand,
      isFallback: true,
    }));
  } catch (e: unknown) {
    if (_.isError(e)) {
      logger.error(`Failed to run fallback handler: ${e.message}`);
    }

    return [];
  }
};

const commandComparator = ({ title }: Command) => title;

const applicationComparator = ({ score }: ApplicationLauncher) => -score;

export const getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getSnippetCommands(),
    ...getManageSnippetCommands(),
    ...getManageCommands(),
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
