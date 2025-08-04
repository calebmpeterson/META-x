import open, { openApp } from "open";
import os from "os";
import path from "path";
import { FOLDER_PREFIX } from "./_constants";
import { SystemCommand } from "./types";

const FOLDERS = [
  "Finder",
  "Applications",
  "Documents",
  "Downloads",
  "Home",
  "Pictures",
  "Workspace",
];

export const getFolders = (): SystemCommand[] =>
  FOLDERS.map((folder) => ({
    prefix: FOLDER_PREFIX,
    title: folder,
    value: folder,
    invoke: async () => {
      if (folder === "Finder") {
        await openApp("Finder");
      } else if (folder === "Applications") {
        await open("/Applications");
      } else if (folder === "Home") {
        await open(os.homedir());
      } else {
        const dirname = path.join(os.homedir(), folder);
        await open(dirname);
      }
    },
  }));
