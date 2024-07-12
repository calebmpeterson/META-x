import _ from "lodash";
import clipboard from "clipboardy";
import { clock } from "../utils/clock.mjs";

const exported = {
  getCurrentSelection: clock("getCurrentSelection", async () => {
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return clipboard.read();
  }),

  setClipboardContent: clock("setClipboardContent", async (contentAsText) => {
    if (_.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  }),
};

export const { getCurrentSelection, setClipboardContent } = exported;
