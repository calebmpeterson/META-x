import { getAllCommands } from "../utils/getAllCommands";
import { setCommandsCatalog } from "./commands";

export const rebuildCatalog = () => {
  console.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};
