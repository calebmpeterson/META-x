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

const BUILT_IN_COMMANDS = [
  _.toUpper,
  _.toLower,
  _.camelCase,
  _.capitalize,
  _.kebabCase,
  _.snakeCase,
  _.startCase,
];

const getBuiltInCommands = () =>
  BUILT_IN_COMMANDS.map((command) => ({
    label: command.name,
    value: command,
  }));

module.exports = {
  getConfigDir,
  getConfig,
  getBuiltInCommands,
};
