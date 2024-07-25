import { createRequire } from "module";
import _ from "lodash";
import open from "open";
import dotenv from "dotenv";
import axios from "axios";
import { ENTER } from "../keystrokes/constants.mjs";
import { getConfigPath } from "./getConfigPath.mjs";
import { execa, $ } from "execa";
import { runAppleScript } from "run-applescript";

export const createScriptContext = (commandFilename) => {
  const require = createRequire(commandFilename);

  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });

  const commandContext = {
    _,
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
    execa,
    $,
    osascript: runAppleScript,
  };

  return commandContext;
};
