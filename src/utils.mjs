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
    title: `⌬ ${name}`,
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

const getApplications = () => {
  const applications = fs
    .readdirSync("/Applications")
    .filter((filename) => {
      const pathname = path.join("/Applications", filename);
      try {
        // If this doesn't throw, then the file is executable
        fs.accessSync(pathname, fs.constants.X_OK);
        return true;
      } catch {
        return false;
      }
    })
    .filter((filename) => !filename.startsWith("."));

  return applications.map((application) => ({
    title: `⚙︎ ${_.get(path.parse(application), "name", application)}`,
    value: path.join("/Applications", application),
    isApplication: true,
  }));
};

const commandComparator = ({ title }) => title;

const getAllCommands = () => {
  try {
    console.time("getAllCommands");
    return [
      ..._.sortBy(
        getCommands()
          .map((command) => ({
            title: `⌁ ${path.basename(command, ".js")}`,
            value: command,
          }))
          .concat(getBuiltInCommands()),
        commandComparator
      ),
      ..._.sortBy(getApplications(), commandComparator),
      ...getCommandsFromFallbackHandler(),
    ];
  } finally {
    console.timeEnd("getAllCommands");
  }
};

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
