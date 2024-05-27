import _ from "lodash";
import clipboard from "clipboardy";

const exported = {
  async getCurrentSelection() {
    console.time("get selection");
    try {
      // This will read the selected text on Linux and the
      // current clipboard contents on macOS and Windows
      return clipboard.read();
    } finally {
      console.timeEnd("get selection");
    }
  },

  async setClipboardContent(contentAsText) {
    if (_.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  },
};

export default exported;

export const { getCurrentSelection, setClipboardContent } = exported;
