import os from "os";
import path from "path";
import open from "open";

export const getFolders = () =>
  ["Documents", "Downloads", "Home", "Pictures"].map((folder) => ({
    title: `⏍ ${folder}`,
    value: folder,
    isFolder: true,
    open: async () => {
      const dirname =
        folder === "Home" ? os.homedir() : path.join(os.homedir(), folder);
      console.log(`Opening ${dirname}`);
      await open(dirname);
    },
  }));
