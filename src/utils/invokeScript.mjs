import { createRequire } from "module";
import fs from "node:fs";
import vm from "node:vm";
import _ from "lodash";
import open from "open";
import dotenv from "dotenv";
import axios from "axios";
import { ENTER } from "../keystrokes/constants.mjs";
import { showCommandErrorDialog } from "./showCommandErrorDialog.mjs";
import { getConfigPath } from "./getConfigPath.mjs";
import { resultToString } from "./resultToString.mjs";

const wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;

export const invokeScript = async (commandFilename, selection) => {
  const require = createRequire(commandFilename);

  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });

  const commandContext = {
    selection,
    require,
    console,
    open,
    get: axios.get,
    post: axios.post,
    put: axios.put,
    patch: axios.patch,
    delete: axios.delete,
    ENV,
    ENTER,
  };

  try {
    const commandSource = fs.readFileSync(commandFilename, "utf8");

    const wrappedCommandSource = wrapCommandSource(commandSource);

    const commandScript = new vm.Script(wrappedCommandSource);

    const result = await commandScript.runInNewContext(commandContext);

    if (!_.isUndefined(result)) {
      return resultToString(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};
