import fs from "fs";
import os from "os";
import path from "path";
import _ from "lodash";
import { createRequire } from "module";
import open, { openApp } from "open";

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

const getApplicationUsageHistory = () =>
  path.join(getConfigDir(), ".application-usage");

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

const persistApplicationUsage = (values) => {
  fs.writeFileSync(
    getApplicationUsageHistory(),
    _.takeRight(values, 100).join("\n"),
    "utf8"
  );
};

const restoreApplicationUsage = () => {
  try {
    return fs.readFileSync(getApplicationUsageHistory(), "utf8").split("\n");
  } catch {
    // The file doesn't exist yet
    return [];
  }
};

const trackApplicationUsage = (value) => {
  const history = restoreApplicationUsage();
  persistApplicationUsage([...history, value]);
};

const getApplications = () => {
  const history = restoreApplicationUsage();
  const scores = _.countBy(history, _.identity);

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

  const items = applications.map((application) => {
    const value = path.join("/Applications", application);
    return {
      title: `⚙︎ ${_.get(path.parse(application), "name", application)}`,
      value,
      isApplication: true,
      score: scores[value] ?? 0,
      execute: async () => {
        console.log(`Opening ${application}`);
        trackApplicationUsage(value);
        await openApp(value);
      },
    };
  });

  return items;
};

const getFolders = () =>
  ["Documents", "Downloads", "Home", "Pictures"].map((folder) => ({
    title: `⏍ ${folder}`,
    value: folder,
    isFolder: true,
    open: async () => {
      const dirname =
        folder === "Home" ? os.homedir() : path.join(os.homedir(), folder);
      console.log(`Opening ${dirname}`);
      await open(dirname);
    },
  }));

const commandComparator = ({ title }) => title;

const applicationComparator = ({ score }) => -score;

const getAllCommands = () => {
  try {
    console.time("getAllCommands");
    const allCommands = [
      ..._.sortBy(
        getCommands()
          .map((command) => ({
            title: `⌁ ${path.basename(command, ".js")}`,
            value: command,
          }))
          .concat(getBuiltInCommands()),
        commandComparator
      ),
      ..._.chain(getApplications())
        .sortBy(commandComparator)
        .sortBy(applicationComparator)
        .value(),
      ...getFolders(),
      ...getCommandsFromFallbackHandler(),
    ];

    return allCommands;
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
