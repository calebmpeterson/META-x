import _ from "lodash";
import { createRequire } from "module";
import open from "open";
import { UNKNOWN_COMMAND } from "../catalog/unknown";
import { getCurrentSelection, setClipboardContent } from "../clipboard/utils";
import { ENTER } from "../keystrokes/constants";
import pressEnter from "../keystrokes/pressEnter";
import { getCommandsCatalog } from "../state/commands";
import { calculate, didCalculate } from "../utils/calculate";
import { createScriptContext } from "../utils/createScriptContext";
import { getCommandFilename } from "../utils/getCommandFilename";
import { invokeShortcut } from "../utils/invokeShortcut";
import { isShortcutResult } from "../utils/isShortcutResult";
import { logger } from "../utils/logger";
import { processInvokeScriptResult } from "../utils/processInvokeScriptResult";
import { showCalculationResultDialog } from "../utils/showCalculationResultDialog";
import { stripKeystrokes } from "../utils/stripKeystrokes";
import prompt from "./prompt";

export default async (injected?: string) => {
  const selection = await getCurrentSelection();

  const commands = getCommandsCatalog();

  const item = injected
    ? (commands.find((command) => command.title === injected) ??
      UNKNOWN_COMMAND)
    : await prompt(commands);

  let result;

  const require = createRequire(import.meta.url);
  Object.assign(global, { open, require });

  // Execute built-in command
  if ("isUnknown" in item) {
    logger.warn(`Unknown command`);
  }
  // Handle built-in functions
  else if ("value" in item && _.isFunction(item.value)) {
    result = item.value(selection);
  }
  // Invoke
  else if ("invoke" in item && _.isFunction(item.invoke)) {
    result = await item.invoke(selection);
  }
  // Unhandled command:
  // 1. attempt to treat as a calculation
  // 2. defer to the fallback handler, if it exists
  else if ("isUnhandled" in item && item.isUnhandled) {
    logger.warn(`Unhandled command: ${item.query}`);

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
        const commandContext = createScriptContext(commandFilename, selection);

        const resultFromFallback = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );

        if (!_.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        logger.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }

  if (result && _.isString(result)) {
    logger.log(`Result: ${result}`);

    // Update clipboard to reflect the command execution result
    await setClipboardContent(stripKeystrokes(result));

    if (result.endsWith(ENTER)) {
      await pressEnter();
    }

    return true;
  } else if (isShortcutResult(result)) {
    await invokeShortcut(result);
  }

  return false;
};
