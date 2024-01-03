import os from "os";
import path from "path";
import open from "open";

export const getFolders = () =>
  ["Applications", "Documents", "Downloads", "Home", "Pictures"].map(
    (folder) => ({
      title: `⏍ ${folder}`,
      value: folder,
      isFolder: true,
      open: async () => {
        if (folder === "Applications") {
          await open("/Applications");
        } else if (folder === "Home") {
          await open(os.homedir());
        } else {
          const dirname = path.join(os.homedir(), folder);
          await open(dirname);
        }
      },
    })
  );
