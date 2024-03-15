import _ from "lodash";

export const resultToString = (result) =>
  _.isArray(result) || _.isObject(result)
    ? JSON.stringify(result, null, "  ")
    : _.toString(result);
