import _ from "lodash";
import fs from "node:fs";
import vm from "node:vm";
import notifier from "node-notifier";
import { createScriptContext } from "./createScriptContext";
import { processInvokeScriptResult } from "./processInvokeScriptResult";
import { showCommandErrorDialog } from "./showCommandErrorDialog";
import { getCommandTitle } from "./getCommandTitle";
import { TITLE } from "../constants";

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

  const timeoutId = setTimeout(() => {
    notifier.notify({
      title: TITLE,
      message: `Meta-x is still invoking ${getCommandTitle(commandFilename)}`,
    });
  }, 5000);

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
  } finally {
    clearTimeout(timeoutId);
  }
};
