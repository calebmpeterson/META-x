import { createRequire } from "module";
import fs from "node:fs";
import vm from "node:vm";
import _ from "lodash";
import open from "open";
import { ENTER } from "../keystrokes/constants.mjs";
import { showCommandErrorDialog } from "./showCommandErrorDialog.mjs";

const wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;

const resultToString = (result) =>
  _.isArray(result) || _.isObject(result)
    ? JSON.stringify(result, null, "  ")
    : _.toString(result);

export const invokeScript = async (commandFilename, selection) => {
  const require = createRequire(import.meta.url);

  const commandContext = {
    selection,
    require,
    console,
    open,
    ENTER,
  };

  try {
    const commandSource = fs.readFileSync(commandFilename, "utf8");

    const wrappedCommandSource = wrapCommandSource(commandSource);

    const commandScript = new vm.Script(wrappedCommandSource);

    const result = commandScript.runInNewContext(commandContext);

    if (!_.isUndefined(result)) {
      return resultToString(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};
