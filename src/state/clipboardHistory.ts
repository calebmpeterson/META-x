import _ from "lodash";
import { isProbablyPassword } from "../utils/isProbablyPassword";

let clipboardHistory: string[] = [];

export const updateClipboardHistory = (entry: string) => {
  if (!isProbablyPassword(entry)) {
    clipboardHistory = _.take(_.uniq([entry, ...clipboardHistory]), 10);
  }
};

export const getClipboardHistory = () => clipboardHistory;