const path = require("path");
const prompts = require("prompts");
const _ = require("lodash");

const { getCurrentSelection, setClipboardContent } = require("../clipboard");
const {
  getCommandFilename,
  getBuiltInCommands,
  getCommands,
  getAllCommands,
} = require("../utils");

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

  console.log(item.value);
})();
