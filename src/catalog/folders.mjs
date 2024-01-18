import os from "os";
import path from "path";
import open from "open";
import { FOLDER_PREFIX } from "./_constants.mjs";

export const getFolders = () =>
  ["Applications", "Documents", "Downloads", "Home", "Pictures"].map(
    (folder) => ({
      title: `${FOLDER_PREFIX} ${folder}`,
      value: folder,
      invoke: async () => {
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
