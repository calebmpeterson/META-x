import fs from "node:fs";
import path from "node:path";
import open from "open";
import { getConfigOption } from "../utils/getConfigOption";
import { SYSTEM_PREFIX } from "./_constants";

const PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";

const DEFAULT_IGNORED: string[] = [];

const getPreferencePanes = () => {
  const ignored = getConfigOption("ignored", DEFAULT_IGNORED);

  return fs
    .readdirSync(PREFERENCE_PANE_ROOT_DIR)
    .map((filename) => path.parse(filename).name)
    .filter((filename) => !ignored.some((ignore) => filename.includes(ignore)));
};

const getPane = (pane: string) =>
  `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;

export const getSystemPreferences = () =>
  getPreferencePanes().map((pane) => ({
    title: `${SYSTEM_PREFIX} ${pane}`,
    value: pane,
    invoke: async () => {
      await open(getPane(pane));
    },
  }));
