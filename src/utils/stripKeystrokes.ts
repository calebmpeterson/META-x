import { ENTER } from "../keystrokes/constants";

export const stripKeystrokes = (text: string) =>
  text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;
