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
import { showCommandErrorDialog } from "../utils/showCommandErrorDialog.mjs";

export default async () => {
  const selection = await getCurrentSelection();

  const commands = getAllCommands();

  const item = await prompt(commands);

  let resultAsText;

  const require = createRequire(import.meta.url);
  Object.assign(global, { open, require });

  const commandContext = {
    open,
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
  // Execute default handler
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    const commandFilename = getCommandFilename("fallback-handler.js");

    try {
      const fallbackHandler = require(commandFilename);

      const result = fallbackHandler.call(
        commandContext,
        selection,
        item.query
      );

      if (!_.isUndefined(result)) {
        resultAsText =
          _.isArray(result) || _.isObject(result)
            ? JSON.stringify(result, null, "  ")
            : _.toString(result);
      }
    } catch (e) {
      console.error(`Failed to execute ${commandFilename}`, e);
    }
  }
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename(item.value);

    try {
      const commandModule = require(`${commandFilename}`);
      const result = commandModule.call(commandContext, selection);

      if (!_.isUndefined(result)) {
        resultAsText =
          _.isArray(result) || _.isObject(result)
            ? JSON.stringify(result, null, "  ")
            : _.toString(result);
      }
    } catch (error) {
      console.error(`Failed to execute ${commandFilename}`, error);
      await showCommandErrorDialog(commandFilename, error);
    }
  }

  if (resultAsText && _.isString(resultAsText)) {
    console.log(`Result: ${resultAsText}`);
    // Update to reflect the command execution result
    await setClipboardContent(resultAsText);

    return true;
  }

  return false;
};
