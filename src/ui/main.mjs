import _ from "lodash";
import { createRequire } from "module";
import open from "open";
import prompt from "./prompt/index.mjs";
import { execaSync } from "execa";
import {
  getCurrentSelection,
  setClipboardContent,
} from "../clipboard/utils.mjs";
import { calculate, didCalculate } from "../utils/calculate.mjs";
import { stripKeystrokes } from "../utils/stripKeystrokes";
import { ENTER } from "../keystrokes/constants";
import pressEnter from "../keystrokes/pressEnter.mjs";
import { invokeScript } from "../utils/invokeScript.mjs";
import { processInvokeScriptResult } from "../utils/processInvokeScriptResult.mjs";
import { showCalculationResultDialog } from "../utils/showCalculationResultDialog.mjs";
import { getCommandsCatalog } from "../state/commands.mjs";
import { getCommandFilename } from "../utils/getCommandFilename";

export default async () => {
  const selection = await getCurrentSelection();

  const commands = getCommandsCatalog();

  const item = await prompt(commands);

  let result;

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
    result = item.value(selection);
  }
  // Invoke
  else if (_.isFunction(item.invoke)) {
    await item.invoke();
  }
  // Unhandled command:
  // 1. attempt to treat as a calculation
  // 2. defer to the fallback handler, if it exists
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    // Attempt to calculate
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      result = String(calculated);
      await showCalculationResultDialog(item.query, result);
    }
    // Execute default handler
    else {
      const commandFilename = getCommandFilename("fallback-handler.js");

      try {
        const fallbackHandler = require(commandFilename);

        const resultFromFallback = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );

        if (!_.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        console.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename(item.value);

    result = await invokeScript(commandFilename, selection);
  }

  if (result && _.isString(result)) {
    console.log(`Result: ${result}`);
    // Update to reflect the command execution result
    await setClipboardContent(stripKeystrokes(result));

    if (result.endsWith(ENTER)) {
      await pressEnter();
    }

    return true;
  } else if (result && _.isObject(result) && "shortcut" in result) {
    const { shortcut, input } = result;
    try {
      await execaSync("shortcuts", ["run", shortcut, "-i", input]);
    } catch (error) {
      console.error(`Failed to run shortcut: ${error.message}`);
    }
  }

  return false;
};
