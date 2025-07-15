import JSON5 from "json5";
import _ from "lodash";
import fs from "node:fs";
import { JsonValue } from "type-fest";
import { getConfigPath } from "./getConfigPath";

export const CONFIG_FILENAME = getConfigPath("config.json");

export const getConfigOption = <T extends JsonValue>(
  key: string,
  defaultValue: T
): T => {
  try {
    const contents = fs.readFileSync(CONFIG_FILENAME, "utf8");
    const json = JSON5.parse(contents);
    return _.get(json, key, defaultValue);
  } catch {
    return defaultValue;
  }
};
