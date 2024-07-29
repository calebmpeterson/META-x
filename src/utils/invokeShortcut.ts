import { execa } from "execa";
import { ShortcutResult } from "../types";
import _ from "lodash";

export const invokeShortcut = async ({ shortcut, input }: ShortcutResult) => {
  try {
    await execa("shortcuts", ["run", shortcut, "-i", input ?? ""]);
  } catch (error: unknown) {
    if (_.isError(error)) {
      console.error(`Failed to run shortcut: ${error.message}`);
    } else {
      console.error(`Failed to run shortcut: ${shortcut}`);
    }
  }
};
