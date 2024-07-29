import _ from "lodash";
import fs from "node:fs";
import vm from "node:vm";
import { createScriptContext } from "./createScriptContext.js";
import { processInvokeScriptResult } from "./processInvokeScriptResult.js";
import { showCommandErrorDialog } from "./showCommandErrorDialog";

const wrapCommandSource = (commandSource: string) => `
const module = {};

${commandSource};

module.exports(selection);
`;

export const invokeScript = async (
  commandFilename: string,
  selection: string
) => {
  const commandContext = createScriptContext(commandFilename, selection);

  try {
    const commandSource = fs.readFileSync(commandFilename, "utf8");

    const wrappedCommandSource = wrapCommandSource(commandSource);

    const commandScript = new vm.Script(wrappedCommandSource);

    const result = await commandScript.runInNewContext(commandContext);

    if (!_.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error: unknown) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};
