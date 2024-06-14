import { execaSync } from "execa";
import { SHORTCUT_PREFIX } from "./_constants.mjs";

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
              await execaSync("shortcuts", ["run", title]);
            } catch (error) {
              console.error(`Failed to run shortcut: ${error.message}`);
            }
          },
        };
      });
    return shortcuts;
  } catch (error) {
    console.error(`Failed to get shortcuts: ${error.message}`);
    return [];
  }
};
