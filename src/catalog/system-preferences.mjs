import fs from "node:fs";
import path from "node:path";
import open from "open";

const PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";

const getPreferencePanes = () =>
  fs
    .readdirSync(PREFERENCE_PANE_ROOT_DIR)
    .map((filename) => path.parse(filename).name);

const getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;

export const getSystemPreferences = () =>
  getPreferencePanes().map((pane) => ({
    title: `⚙︎ ${pane}`,
    value: pane,
    isFolder: true,
    open: async () => {
      console.log(`Opening ${pane}`);
      await open(getPane(pane));
    },
  }));
