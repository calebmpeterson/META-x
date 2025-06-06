import { execaSync } from "execa";
import { SHORTCUT_PREFIX } from "./_constants";
import _ from "lodash";
import { logger } from "../utils/logger";

export const getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"])
      .stdout.split("\n")
      .filter(Boolean)
      .map((shortcut) => {
        return {
          title: `${SHORTCUT_PREFIX} ${shortcut}`,
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
