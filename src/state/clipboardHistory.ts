import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import _ from "lodash";
import { getConfigDir } from "../utils/getConfigDir";
import { isProbablyPassword } from "../utils/isProbablyPassword";

const HISTORY_FILE = getConfigDir(".clipboard-history");
const MAX_ENTRIES = 10;

const restoreClipboardHistory = (): string[] => {
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf8"));
  } catch {
    return [];
  }
};

const persistClipboardHistory = (history: string[]) => {
  void writeFile(HISTORY_FILE, JSON.stringify(history), "utf8");
};

let clipboardHistory: string[] = restoreClipboardHistory();

export const updateClipboardHistory = (entry: string) => {
  if (!isProbablyPassword(entry) && entry.length > 1) {
    clipboardHistory = _.take(_.uniq([entry, ...clipboardHistory]), MAX_ENTRIES);
    persistClipboardHistory(clipboardHistory);
  }
};

export const getClipboardHistory = () => clipboardHistory;
