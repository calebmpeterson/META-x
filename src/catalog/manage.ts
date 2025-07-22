import fs from "node:fs";
import { rebuildCatalog } from "../state/rebuildCatalog";
import { SCRIPTS_DIR } from "../utils/getConfigDir";
import { MANAGE_SCRIPTS_PREFIX } from "./_constants";

// Ensure the scripts directory exists
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

export const getManageCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Reload`,
    invoke: async () => {
      rebuildCatalog();
    },
  },
];
