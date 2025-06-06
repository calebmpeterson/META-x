import _ from "lodash";
import { createRequire } from "node:module";
import { getBuiltInCommands } from "../catalog/built-ins";
import { getFolders } from "../catalog/folders";
import { getApplications } from "../catalog/applications";
import { getSystemPreferences } from "../catalog/system-preferences";
import { getSystemCommands } from "../catalog/system";
import { getManageScriptCommands } from "../catalog/manage-scripts";
import { getScriptCommands } from "../catalog/scripts";
import { getShortcuts } from "../catalog/shortcuts";
import { clock } from "./clock";
import { getCommandFilename } from "./getCommandFilename";
import { ApplicationLauncher, Command } from "../catalog/types";
import { getManageSnippetCommands } from "../catalog/manage-snippets";
import { getSnippetCommands } from "../catalog/snippets";
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
