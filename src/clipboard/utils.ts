import _ from "lodash";
import clipboard from "clipboardy";
import { clock } from "../utils/clock";

export const getCurrentSelection = clock("getCurrentSelection", async () => {
  // This will read the selected text on Linux and the
  // current clipboard contents on macOS and Windows
  return clipboard.read();
});

export const setClipboardContent = clock(
  "setClipboardContent",
  async (contentAsText: string) => {
    if (_.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  },
);

export const getClipboardContent = async () => {
  // This will read the selected text on Linux and the
  // current clipboard contents on macOS and Windows
  return clipboard.read();
};
