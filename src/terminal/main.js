const path = require("path");
const prompts = require("prompts");
const _ = require("lodash");

const { getCurrentSelection, setClipboardContent } = require("../clipboard");
const {
  getCommandFilename,
  getBuiltInCommands,
  getCommands,
} = require("../utils");

const getAllCommands = () =>
  getCommands()
    .map((command) => ({
      title: path.basename(command, ".js"),
      value: command,
    }))
    .concat(getBuiltInCommands());

const suggest = (input, choices) =>
  Promise.resolve(
    choices.filter(({ title }) =>
      title.toLowerCase().includes(input.toLowerCase())
    )
  );

(async () => {
  const item = await prompts({
    type: "autocomplete",
    name: "value",
    message: "",
    choices: getAllCommands(),
    suggest,
  });

  const selection = getCurrentSelection();

  let resultAsText;

  // Execute built-in command
  if (_.isFunction(item.value)) {
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

  // Update to reflect the command execution result
  setClipboardContent(resultAsText);
})();
