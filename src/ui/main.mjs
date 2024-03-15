import _ from "lodash";
import { createRequire } from "module";
import open from "open";
import prompt from "./prompt/index.mjs";
import {
  getCurrentSelection,
  setClipboardContent,
} from "../clipboard/utils.mjs";
import {
  getCommandFilename,
  getAllCommands,
} from "../utils/getAllCommands.mjs";
import { calculate, didCalculate } from "../utils/calculate.mjs";
import { stripKeystrokes } from "../utils/stripKeystrokes.mjs";
import { ENTER } from "../keystrokes/constants.mjs";
import pressEnter from "../keystrokes/pressEnter.mjs";
import { invokeScript } from "../utils/invokeScript.mjs";
import { resultToString } from "../utils/resultToString.mjs";

export default async () => {
  const selection = await getCurrentSelection();

  const commands = getAllCommands();

  const item = await prompt(commands);

  let resultAsText;

  const require = createRequire(import.meta.url);
  Object.assign(global, { open, require });

  const commandContext = {
    open,
    ENTER,
  };

  // Execute built-in command
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  }
  // Handle built-in functions
  else if (_.isFunction(item.value)) {
    resultAsText = item.value(selection);
  }
  // Invoke
  else if (_.isFunction(item.invoke)) {
    await item.invoke();
  }
  // Unhandled command: attempt to treat as a calculation, then defer to the fallback handler
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    // Attempt to calculate
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      resultAsText = String(calculated);
    }
    // Execute default handler
    else {
      const commandFilename = getCommandFilename("fallback-handler.js");

      try {
        const fallbackHandler = require(commandFilename);

        const result = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );

        if (!_.isUndefined(result)) {
          resultAsText = resultToString(result);
        }
      } catch (e) {
        console.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename(item.value);

    resultAsText = await invokeScript(commandFilename, selection);
  }

  if (resultAsText && _.isString(resultAsText)) {
    console.log(`Result: ${resultAsText}`);
    // Update to reflect the command execution result
    await setClipboardContent(stripKeystrokes(resultAsText));

    if (resultAsText.endsWith(ENTER)) {
      await pressEnter();
    }

    return true;
  }

  return false;
};
