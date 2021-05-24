const fs = require("fs");
const os = require("os");
const path = require("path");
const _ = require("lodash");

const DEFAULT_CONFIG = {
  hotkey: "Alt+X",
};

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

const getConfig = () => {
  const configFilename = path.join(getConfigDir(), "config.json");
  try {
    const configJSON = fs.readFileSync(configFilename, "UTF-8");
    return _.merge({}, DEFAULT_CONFIG, JSON.parse(configJSON));
  } catch (e) {
    console.warn(`Failed to read config from ${configFilename}`);
    return DEFAULT_CONFIG;
  }
};

const BUILT_IN_COMMANDS = {
  "to-upper": _.toUpper,
  "to-lower": _.toLower,
  "camel-case": _.camelCase,
  capitalize: _.capitalize,
  "kebab-case": _.kebabCase,
  "snake-case": _.snakeCase,
  "start-case": _.startCase,
};

const getBuiltInCommands = () =>
  _.map(BUILT_IN_COMMANDS, (command, name) => ({
    label: name,
    title: name,
    value: command,
  }));

const getCommands = () =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    );

const getCommandFilename = (commandFilename) =>
  path.join(getConfigDir(), commandFilename);

const getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename("fallback-handler.js");
  try {
    const fallbackHandler = require(commandFilename);

    const fallbackCommands =
      fallbackHandler.suggestions && fallbackHandler.suggestions.call();

    return fallbackCommands.map((fallbackCommand) => ({
      label: fallbackCommand,
      title: fallbackCommand,
      value: fallbackCommand,
      isFallback: true,
    }));
  } catch (e) {
    return [];
  }
};

const commandComparator = ({ title }) => title;

const ALL_COMMANDS = _.sortBy(
  getCommands()
    .map((command) => ({
      title: path.basename(command, ".js"),
      value: command,
    }))
    .concat(getBuiltInCommands())
    .concat(getCommandsFromFallbackHandler()),
  commandComparator
);

const getAllCommands = () => ALL_COMMANDS;

module.exports = {
  getConfigDir,
  getConfig,
  getBuiltInCommands,
  getCommands,
  getAllCommands,
  getCommandFilename,
};
