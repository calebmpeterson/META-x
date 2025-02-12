import _ from "lodash";
import axios from "axios";
import dotenv from "dotenv";
import open from "open";
import { ENTER } from "../keystrokes/constants";
import { choose } from "./choose";
import { createRequire } from "module";
import { execa, $ } from "execa";
import { getConfigPath } from "./getConfigPath.js";
import { runAppleScript } from "run-applescript";
import { showNotification } from "./showNotification";

export const createScriptContext = (
  commandFilename: string,
  selection: string
) => {
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
    choose,
    notify: showNotification,
  };

  return commandContext;
};
