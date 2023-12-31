import { keyboard, Key } from '@nut-tree/nut-js';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { createRequire } from 'module';
import os from 'os';
import open, { openApp } from 'open';
import fs$1 from 'node:fs';
import path$1 from 'node:path';
import { execa } from 'execa';
import { exec } from 'child_process';
import clipboard from 'clipboardy';

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

const getApplicationUsageHistory = () =>
  path.join(getConfigDir(), ".application-usage");

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
      fs.statSync(pathname);

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

const PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";

const getPreferencePanes = () =>
  fs$1
    .readdirSync(PREFERENCE_PANE_ROOT_DIR)
    .map((filename) => path$1.parse(filename).name);

const getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;

const getSystemPreferences = () =>
  getPreferencePanes().map((pane) => ({
    title: `⚙︎ ${pane}`,
    value: pane,
    isFolder: true,
    open: async () => {
      await open(getPane(pane));
    },
  }));

const getConfigDir$1 = () => path.join(os.homedir(), ".meta-x");

const getSystemCommands = () => [
  {
    title: "Sleep",
    isApplication: true,
    execute: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: "Sleep Displays",
    isApplication: true,
    execute: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
];

const getCommands = () =>
  fs
    .readdirSync(getConfigDir$1())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `⌁ ${path.basename(command, ".js")}`,
      value: command,
    }));

const getCommandFilename = (commandFilename) =>
  path.join(getConfigDir$1(), commandFilename);

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

const applicationComparator = ({ score }) => -score;

const getAllCommands = () => {
  try {
    console.time("getAllCommands");
    const allCommands = [
      ..._.sortBy(
        [...getCommands(), ...getBuiltInCommands()],
        commandComparator
      ),
      ...getFolders(),
      ...getSystemPreferences(),
      ...getSystemCommands(),
      ..._.chain(getApplications())
        .sortBy(commandComparator)
        .sortBy(applicationComparator)
        .value(),
      ...getCommandsFromFallbackHandler(),
    ];

    return allCommands;
  } finally {
    console.timeEnd("getAllCommands");
  }
};

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

var prepareDarwin$1 = async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
};

var prepareClipboard = () =>
  process.platform === "darwin" ? prepareDarwin$1() : Promise.resolve();

var prepareDarwin = async () => {
  await delay(20);
  await keyboard.type(Key.LeftSuper, Key.V);
};

var finishClipboard = () =>
  process.platform === "darwin" ? prepareDarwin() : Promise.resolve();

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
var promptDarwin = (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const toShow = Math.min(20, _.size(commands));
    const cmd = `echo "${choices}" | choose -b 000000 -c 222222 -w 30 -s 18 -m -n ${toShow}`;
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = _.trim(stdout);
        const rawQueryCommand = {
          isUnhandled: true,
          query,
        };
        const command =
          commands.find(
            ({ title, isFallback }) => title === query && !isFallback
          ) || rawQueryCommand;
        resolve(command);
      } else {
        if (error) {
          console.error(error);
        }
        resolve({
          isUnknown: true,
        });
      }
    });
  });

// Uses dmenu
var promptLinux = (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const cmd = `echo "${choices}" | dmenu -i -b`;
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = _.trim(stdout);
        resolve(commands.find(({ title }) => title === query));
      } else {
        if (error) {
          console.error(error);
        }
        resolve({
          isUnknown: true,
        });
      }
    });
  });

var prompt = (...args) =>
  process.platform === "darwin" ? promptDarwin(...args) : promptLinux(...args);

const exported = {
  async getCurrentSelection() {
    // This will read the selected text on Linux and the
    // current clipboard contents on macOS and Windows
    return clipboard.read();
  },

  async setClipboardContent(contentAsText) {
    if (_.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  },
};

const { getCurrentSelection, setClipboardContent } = exported;

var openTerminal = async () => {
  const selection = await getCurrentSelection();

  const commands = getAllCommands();

  const item = await prompt(commands);

  let resultAsText;

  const require = createRequire(import.meta.url);
  Object.assign(global, { open, require });

  const commandContext = {
    open,
  };

  // Execute built-in command
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  }
  // Handle built-in functions
  else if (_.isFunction(item.value)) {
    resultAsText = item.value(selection);
  }
  // Execute an application
  else if (item.isApplication) {
    await item.execute();
  }
  // Opens a folder
  else if (item.isFolder) {
    await item.open();
  }
  // Execute default handler
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    const commandFilename = getCommandFilename("fallback-handler.js");

    try {
      const fallbackHandler = require(commandFilename);

      const result = fallbackHandler.call(
        commandContext,
        selection,
        item.query
      );

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
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename(item.value);

    try {
      const commandModule = require(`${commandFilename}`);
      const result = commandModule.call(commandContext, selection);

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
    await setClipboardContent(resultAsText);

    return true;
  }

  return false;
};

const launch = async () => {
  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await openTerminal();
  if (result) {
    await finishClipboard();
  }
};

launch();
