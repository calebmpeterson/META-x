import { execa } from "execa";
import { ShortcutResult } from "../types";
import _ from "lodash";
import { logger } from "./logger";

export const invokeShortcut = async ({ shortcut, input }: ShortcutResult) => {
  try {
    await execa("shortcuts", ["run", shortcut, "-i", input ?? ""]);
  } catch (error: unknown) {
    if (_.isError(error)) {
      logger.error(`Failed to run shortcut: ${error.message}`);
    } else {
      logger.error(`Failed to run shortcut: ${shortcut}`);
    }
  }
};
