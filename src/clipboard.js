const { clipboard } = require("electron");

module.exports = {
  getCurrentSelection() {
    return clipboard.readText("selection");
  },

  setClipboardContent(contentAsText) {
    clipboard.writeText(contentAsText);
  },
};
