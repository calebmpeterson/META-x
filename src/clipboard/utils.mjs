import _ from "lodash";
import clipboard from "clipboardy";

const exported = {
  async getCurrentSelection() {
    console.time("getCurrentSelection");
    try {
      // This will read the selected text on Linux and the
      // current clipboard contents on macOS and Windows
      return clipboard.read();
    } finally {
      console.timeEnd("getCurrentSelection");
    }
  },

  async setClipboardContent(contentAsText) {
    console.time("setClipboardContent");
    try {
      if (_.isString(contentAsText)) {
        await clipboard.write(contentAsText);
      }
    } finally {
      console.timeEnd("setClipboardContent");
    }
  },
};

export default exported;

export const { getCurrentSelection, setClipboardContent } = exported;
