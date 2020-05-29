const path = require("path");
const _ = require("lodash");

const prompt = require("./darwin");

const { getCurrentSelection, setClipboardContent } = require("../clipboard");
const {
  getCommandFilename,
  getBuiltInCommands,
  getCommands,
  getAllCommands,
} = require("../utils");

module.exports = async () => {
  const selection = await getCurrentSelection();

  const item = await prompt(getAllCommands());

  let resultAsText;

  // Execute built-in command
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  } else if (_.isFunction(item.value)) {
    resultAsText = item.value(selection);
  }
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename(item.value);

    try {
      const commandModule = require(`${commandFilename}`);
      const result = commandModule.call(null, selection);
      console.log(`Result: ${result}`);

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
  }
};
