import _ from 'lodash';

const exported = {
  async getCurrentSelection() {
    const { default: clipboard } = await import("clipboardy");
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return clipboard.read();
  },

  async setClipboardContent(contentAsText) {
    if (_.isString(contentAsText)) {
      const { default: clipboard } = await import("clipboardy");

      await clipboard.write(contentAsText);
    }
  }
};

export default exported;

export const {
  getCurrentSelection,
  setClipboardContent
} = exported;
