import { getAllCommands } from "../utils/getAllCommands";
import { setCommandsCatalog } from "./commands";
import { logger } from "../utils/logger";

export const rebuildCatalog = () => {
  logger.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};
