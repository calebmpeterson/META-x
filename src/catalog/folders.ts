import os from "os";
import path from "path";
import open, { openApp } from "open";
import { FOLDER_PREFIX } from "./_constants";

export const getFolders = () =>
  [
    "Finder",
    "Applications",
    "Documents",
    "Downloads",
    "Home",
    "Pictures",
    "Workspace",
  ].map((folder) => ({
    title: `${FOLDER_PREFIX} ${folder}`,
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
