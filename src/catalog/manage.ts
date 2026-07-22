import fs from "node:fs";
import { rebuildCatalog } from "../state/rebuildCatalog";
import { SCRIPTS_DIR } from "../utils/getConfigDir";
import { clearConfigCache, CONFIG_FILENAME } from "../utils/getConfigOption";
import { openInSystemEditor } from "../utils/openInSystemEditor";
import { CONFIGURE_PREFIX, RELOAD_PREFIX } from "./_constants";
import { TITLE } from "../constants";

// Ensure the scripts directory exists
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

export const getManageCommands = () => [
  {
    prefix: RELOAD_PREFIX,
    title: `Reload`,
    invoke: async () => {
      clearConfigCache();
      rebuildCatalog();
    },
  },
  {
    prefix: CONFIGURE_PREFIX,
    title: `Configure ${TITLE}`,
    invoke: async () => {
      openInSystemEditor(CONFIG_FILENAME, "");
    },
  },
];
