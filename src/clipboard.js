const { isString } = require("lodash");

module.exports = {
  async getCurrentSelection() {
    const { default: clipboard } = await import("clipboardy");
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return clipboard.read();
  },

  async setClipboardContent(contentAsText) {
    if (isString(contentAsText)) {
      const { default: clipboard } = await import("clipboardy");

      await clipboard.write(contentAsText);
    }
  },
};
