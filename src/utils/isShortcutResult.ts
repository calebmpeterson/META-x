import _ from "lodash";
import { ShortcutResult } from "../types";

export const isShortcutResult = (result: unknown): result is ShortcutResult =>
  Boolean(result) &&
  _.isObject(result) &&
  "shortcut" in result &&
  _.isString(result.shortcut);
