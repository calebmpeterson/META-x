import fs from "node:fs";
import { rebuildCatalog } from "../state/rebuildCatalog";
import { SCRIPTS_DIR } from "../utils/getConfigDir";
import { clearConfigCache, CONFIG_FILENAME } from "../utils/getConfigOption";
import { openInSystemEditor } from "../utils/openInSystemEditor";
import { CONFIGURE_PREFIX, RELOAD_PREFIX } from "./_constants";

// Ensure the scripts directory exists
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

export const getManageCommands = () => [
  {
    title: `${RELOAD_PREFIX} Reload`,
    invoke: async () => {
      clearConfigCache();
      rebuildCatalog();
    },
  },
  {
    title: `${CONFIGURE_PREFIX} Configure`,
    invoke: async () => {
      openInSystemEditor(CONFIG_FILENAME, "");
    },
  },
];
