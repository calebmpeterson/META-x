import { ENTER } from "../keystrokes/constants.mjs";

export const stripKeystrokes = (text) =>
  text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;
