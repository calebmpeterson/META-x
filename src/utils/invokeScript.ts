import _ from "lodash";
import fs from "node:fs";
import vm from "node:vm";
import { createScriptContext } from "./createScriptContext";
import { getCommandTitle } from "./getCommandTitle";
import { logger } from "./logger";
import { processInvokeScriptResult } from "./processInvokeScriptResult";
import { showCommandErrorDialog } from "./showCommandErrorDialog";
import { showNotification } from "./showNotification";

const wrapCommandSource = (commandSource: string) => `
const module = {};

${commandSource};

module.exports(selection);
`;

export const invokeScript = async (
  commandFilename: string,
  selection: string
) => {
  console.log(`Invoking ${commandFilename}`);
  const commandContext = createScriptContext(commandFilename, selection);

  const timeoutId = setTimeout(() => {
    showNotification({
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
    logger.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  } finally {
    clearTimeout(timeoutId);
  }
};
