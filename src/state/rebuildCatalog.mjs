import { getAllCommands } from "../utils/getAllCommands.mjs";
import { setCommandsCatalog } from "./commands.mjs";

export const rebuildCatalog = () => {
  console.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};
