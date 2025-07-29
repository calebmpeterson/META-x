import JSON5 from "json5";
import _ from "lodash";
import fs from "node:fs";
import { JsonValue } from "type-fest";
import { getConfigPath } from "./getConfigPath";

export const CONFIG_FILENAME = getConfigPath("config.json");

const CACHE: Record<string, JsonValue> = {};

export const getConfigOption = <T extends JsonValue>(
  key: string,
  defaultValue: T
): T => {
  if (_.has(CACHE, key)) {
    return CACHE[key] as T;
  }

  try {
    const contents = fs.readFileSync(CONFIG_FILENAME, "utf8");
    const json = JSON5.parse(contents);
    const value = _.get(json, key, defaultValue);

    CACHE[key] = value;

    return value;
  } catch {
    return defaultValue;
  }
};

export const clearConfigCache = () => {
  Object.keys(CACHE).forEach((key) => {
    delete CACHE[key];
  });
};
