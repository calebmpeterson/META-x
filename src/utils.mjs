import fs from "fs";
import os from "os";
import path from "path";
import _ from "lodash";
import { createRequire } from "module";

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

const BUILT_IN_COMMANDS = {
  "to-upper": _.toUpper,
  "to-lower": _.toLower,
  "camel-case": _.camelCase,
  capitalize: _.capitalize,
  "kebab-case": _.kebabCase,
  "snake-case": _.snakeCase,
  "start-case": _.startCase,
  deburr: _.deburr,
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
    const require = createRequire(import.meta.url);
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
    console.error(`Failed to run fallback handler: ${e.message}`);
    return [];
  }
};

const commandComparator = ({ title }) => title;

const getAllCommands = () =>
  _.sortBy(
    getCommands()
      .map((command) => ({
        title: path.basename(command, ".js"),
        value: command,
      }))
      .concat(getBuiltInCommands()),
    commandComparator
  ).concat(getCommandsFromFallbackHandler());

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

export {
  getConfigDir,
  getBuiltInCommands,
  getCommands,
  getAllCommands,
  getCommandFilename,
  delay,
};
