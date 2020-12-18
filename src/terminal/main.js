const path = require("path");
const _ = require("lodash");
const { shell } = require("electron");

const prompt = require("./prompt");

const { getCurrentSelection, setClipboardContent } = require("../clipboard");
const { getCommandFilename, getAllCommands } = require("../utils");

module.exports = async () => {
  const selection = await getCurrentSelection();

  const commands = getAllCommands();

  const item = await prompt(commands);

  let resultAsText;

  const commandContext = {
    shell,
  };

  // Execute built-in command
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  } else if (_.isFunction(item.value)) {
    resultAsText = item.value(selection);
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
    } catch (e) {
      console.error(`Failed to execute ${commandFilename}`, e);
    }
  }

  if (resultAsText && _.isString(resultAsText)) {
    console.log(`Result: ${resultAsText}`);
    // Update to reflect the command execution result
    setClipboardContent(resultAsText);

    return true;
  }

  return false;
};
