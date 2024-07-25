import _ from "lodash";
import dotenv from "dotenv";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "module";
import { createScriptContext } from "./createScriptContext.mjs";
import { getConfigPath } from "./getConfigPath.mjs";
import { processInvokeScriptResult } from "./processInvokeScriptResult.mjs";
import { showCommandErrorDialog } from "./showCommandErrorDialog.mjs";

const wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;

export const invokeScript = async (commandFilename, selection) => {
  const require = createRequire(commandFilename);

  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });

  const commandContext = createScriptContext(commandFilename);

  try {
    const commandSource = fs.readFileSync(commandFilename, "utf8");

    const wrappedCommandSource = wrapCommandSource(commandSource);

    const commandScript = new vm.Script(wrappedCommandSource);

    const result = await commandScript.runInNewContext(commandContext);

    if (!_.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};
