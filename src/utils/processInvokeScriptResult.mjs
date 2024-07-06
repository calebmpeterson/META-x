import _ from "lodash";

export const processInvokeScriptResult = (result) =>
  _.isArray(result) || _.isObject(result) ? result : _.toString(result);
