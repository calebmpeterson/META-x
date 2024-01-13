import fs from "node:fs";
import { getPathnameWithExtension } from "./getPathnameWithExtension.mjs";

const TEMPLATE = `
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};

module.exports.suggestions = function () {
  // The suggestions should be an array of strings
  return ["suggestion one", "suggestion two", "suggestion three"];
};
`.trim();

export const ensureEmptyFallbackHandler = () => {
  const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

  if (!fs.existsSync(fallbackHandlerFilename)) {
    fs.writeFileSync(fallbackHandlerFilename, TEMPLATE, "utf8");
  }
};
