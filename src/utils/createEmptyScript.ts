import fs from "node:fs";
import { getPathnameWithExtension } from "./getPathnameWithExtension";

const TEMPLATE = `
module.exports = (selection) => {
  // \`this\` is bound to the Command Context. API documentation can be
  // found at https://github.com/calebmpeterson/META-x#command-context.

  // Modify the currently selected text and return the replacement text.
  // return selection.toUpperCase();

  // Or perform some other side-effect and return undefined, in which
  // case the currently selected text will not be transformed.
  // return undefined;

  // Or return a shortcut to run a macOS Shortcut with the output of the command:
  //
  // return {
  //   shortcut: "Your Shortcut",
  //   input: selection.toUpperCase(),
  // };
};
`.trim();

export const createEmptyScript = (pathname: string) => {
  const nameWithExtension = getPathnameWithExtension(pathname);

  if (!fs.existsSync(nameWithExtension)) {
    fs.writeFileSync(nameWithExtension, TEMPLATE, "utf8");
  }
};
