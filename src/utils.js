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
  fs.readdirSync(getConfigDir()).filter((file) => file.endsWith(".js"));

module.exports = {
  getConfigDir,
  getConfig,
  getBuiltInCommands,
  getCommands,
};
