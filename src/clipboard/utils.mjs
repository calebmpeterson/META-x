import _ from "lodash";
import clipboard from "clipboardy";

const exported = {
  async getCurrentSelection() {
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return clipboard.read();
  },

  async setClipboardContent(contentAsText) {
    if (_.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  },
};

export default exported;

export const { getCurrentSelection, setClipboardContent } = exported;
