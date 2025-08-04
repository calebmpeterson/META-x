import { execaSync } from "execa";
import _ from "lodash";
import { logger } from "../utils/logger";
import { SHORTCUT_PREFIX } from "./_constants";

export const getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"])
      .stdout.split("\n")
      .filter(Boolean)
      .map((shortcut) => {
        return {
          prefix: SHORTCUT_PREFIX,
          title: shortcut,
          invoke: async () => {
            try {
              execaSync("shortcuts", ["run", shortcut]);
            } catch (error: unknown) {
              if (_.isError(error)) {
                logger.error(`Failed to run shortcut: ${error.message}`);
              }
            }
          },
        };
      });
    return shortcuts;
  } catch (error: unknown) {
    if (_.isError(error)) {
      logger.error(`Failed to get shortcuts: ${error.message}`);
    }
    return [];
  }
};
