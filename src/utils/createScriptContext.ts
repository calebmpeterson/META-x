import { Key, keyboard } from "@nut-tree-fork/nut-js";
import axios from "axios";
import dotenv from "dotenv";
import { $, execa } from "execa";
import _ from "lodash";
import { createRequire } from "module";
import open from "open";
import { runAppleScript } from "run-applescript";
import { ENTER } from "../keystrokes/constants";
import { choose } from "./choose";
import { getConfigPath } from "./getConfigPath.js";
import { invokeNativeTool } from "./invokeNativeTool";
import { showNotification } from "./showNotification";
import { delay } from "./delay";

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
    setTimeout,
    delay,

    // Display a message to the user with an optional timeout
    display: async (message: string, timeout?: string | number) => {
      await invokeNativeTool({ tool: "display.tool", message, timeout });
    },

    keyboard,
    Key,
  };

  return commandContext;
};
