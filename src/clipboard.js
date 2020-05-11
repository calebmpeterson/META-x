const { isString } = require("lodash");
const { clipboard } = require("electron");

module.exports = {
  getCurrentSelection() {
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return Promise.resolve(clipboard.readText("selection"));
  },

  setClipboardContent(contentAsText) {
    if (isString(contentAsText)) {
      clipboard.writeText(contentAsText);
    }
  },
};
