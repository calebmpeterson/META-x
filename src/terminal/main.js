const path = require("path");
const prompts = require("prompts");

const { getConfigDir, getBuiltInCommands, getCommands } = require("../utils");

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
  const response = await prompts({
    type: "autocomplete",
    name: "value",
    message: "",
    choices: getAllCommands(),
    suggest,
  });

  console.clear();
  console.log(response);
})();
