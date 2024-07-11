import ora from 'ora';
import notifier from 'node-notifier';
import { keyboard, Key } from '@nut-tree/nut-js';
import _ from 'lodash';
import { createRequire } from 'module';
import open, { openApp } from 'open';
import { exec } from 'child_process';
import { execa, execaSync } from 'execa';
import clipboard from 'clipboardy';
import path$1 from 'path';
import os from 'os';
import fs from 'fs';
import fs$1 from 'node:fs';
import * as path from 'node:path';
import path__default from 'node:path';
import cocoaDialog from 'cocoa-dialog';
import vm from 'node:vm';
import dotenv from 'dotenv';
import axios from 'axios';
import os$1 from 'node:os';
import net from 'node:net';

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
        if (error && process.env.NODE_ENV === "development") {
          console.error(error.stack);
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
    console.time("getCurrentSelection");
    try {
      // This will read the selected text on Linux and the
      // current clipboard contents on macOS and Windows
      return clipboard.read();
    } finally {
      console.timeEnd("getCurrentSelection");
    }
  },

  async setClipboardContent(contentAsText) {
    console.time("setClipboardContent");
    try {
      if (_.isString(contentAsText)) {
        await clipboard.write(contentAsText);
      }
    } finally {
      console.timeEnd("setClipboardContent");
    }
  },
};

const { getCurrentSelection, setClipboardContent } = exported;

const SCRIPT_PREFIX = "ƒո";
const MANAGE_SCRIPTS_PREFIX = "⛮";
const FOLDER_PREFIX = "⌂";
const APPLICATION_PREFIX = "⌬";
const SYSTEM_PREFIX = "⚙︎";
const SHORTCUT_PREFIX = "⌘";

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
    title: `${SCRIPT_PREFIX} ${name}`,
    value: command,
  }));

const getFolders = () =>
  ["Applications", "Documents", "Downloads", "Home", "Pictures"].map(
    (folder) => ({
      title: `${FOLDER_PREFIX} ${folder}`,
      value: folder,
      invoke: async () => {
        if (folder === "Applications") {
          await open("/Applications");
        } else if (folder === "Home") {
          await open(os.homedir());
        } else {
          const dirname = path$1.join(os.homedir(), folder);
          await open(dirname);
        }
      },
    })
  );

const getConfigDir = () => path$1.join(os.homedir(), ".meta-x");

const getApplicationUsageHistory = () =>
  path$1.join(getConfigDir(), ".application-usage");

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

const getApplications = (rootDir = "/Applications") => {
  const history = restoreApplicationUsage();
  const scores = _.countBy(history, _.identity);

  const applications = fs
    .readdirSync(rootDir)
    .filter((filename) => {
      const pathname = path$1.join(rootDir, filename);
      const stats = fs.statSync(pathname);
      if (stats.isDirectory() && !filename.endsWith(".app")) {
        return false;
      }

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
    const value = path$1.join(rootDir, application);
    return {
      title: `${APPLICATION_PREFIX} ${_.get(
        path$1.parse(application),
        "name",
        application
      )}`,
      value,
      score: scores[value] ?? 0,
      invoke: async () => {
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
    .map((filename) => path__default.parse(filename).name);

const getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;

const getSystemPreferences = () =>
  getPreferencePanes().map((pane) => ({
    title: `${SYSTEM_PREFIX} ${pane}`,
    value: pane,
    invoke: async () => {
      await open(getPane(pane));
    },
  }));

const getSystemCommands = () => [
  {
    title: `${SYSTEM_PREFIX} Sleep`,
    invoke: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: `${SYSTEM_PREFIX} Sleep Displays`,
    invoke: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
  {
    title: `${SYSTEM_PREFIX} About This Mac`,
    invoke: async () => {
      await execa("open", ["-a", "About This Mac"]);
    },
  },
];

const getPathnameWithExtension = (pathname) =>
  pathname.endsWith(".js") ? pathname : `${pathname}.js`;

const TEMPLATE$1 = `
module.exports = (selection) => {
  // \`this\` is bound to the Command Context. API documentation can be
  // found at https://github.com/calebmpeterson/META-x#command-context.

  // Modify the currently selected text and return the replacement text.
  //
  // Or perform some other side-effect and return undefined, in which
  // case the currently selected text will not be transformed.
  return selection.toUpperCase();
};
`.trim();

const createEmptyScript = (pathname) => {
  const nameWithExtension = getPathnameWithExtension(pathname);

  if (!fs$1.existsSync(nameWithExtension)) {
    fs$1.writeFileSync(nameWithExtension, TEMPLATE$1, "utf8");
  }
};

const editScript = async (pathname) => {
  await execa(process.env.EDITOR, [getPathnameWithExtension(pathname)]);
};

const TEMPLATE = `
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};

module.exports.suggestions = function () {
  // The suggestions should be an array of strings
  return ["suggestion one", "suggestion two", "suggestion three"];
};
`.trim();

const ensureEmptyFallbackHandler = () => {
  const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

  if (!fs$1.existsSync(fallbackHandlerFilename)) {
    fs$1.writeFileSync(fallbackHandlerFilename, TEMPLATE, "utf8");
  }
};

const getManageScriptCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Create Script`,
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Script As...",
        withDirectory: getConfigDir(),
      });

      if (!_.isEmpty(result)) {
        createEmptyScript(result);
        await editScript(result);
      }
    },
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Script`,
    invoke: async () => {
      const result = await cocoaDialog("fileselect", {
        title: "Choose Script To Edit...",
        withDirectory: getConfigDir(),
      });

      if (!_.isEmpty(result)) {
        await editScript(result);
      }
    },
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

      ensureEmptyFallbackHandler();

      await editScript(fallbackHandlerFilename);
    },
  },
];

const getScriptCommands = () =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `${SCRIPT_PREFIX} ${path$1.basename(command, ".js")}`,
      value: command,
    }));

const getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"])
      .stdout.split("\n")
      .filter(Boolean)
      .map((shortcut) => {
        return {
          title: `${SHORTCUT_PREFIX} ${shortcut}`,
          invoke: async () => {
            try {
              await execaSync("shortcuts", ["run", shortcut]);
            } catch (error) {
              console.error(`Failed to run shortcut: ${error.message}`);
            }
          },
        };
      });
    return shortcuts;
  } catch (error) {
    console.error(`Failed to get shortcuts: ${error.message}`);
    return [];
  }
};

const getCommandFilename$1 = (commandFilename) =>
  path$1.join(getConfigDir(), commandFilename);

const getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename$1("fallback-handler.js");
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
        [...getScriptCommands(), ...getBuiltInCommands()],
        commandComparator
      ),
      ...getManageScriptCommands(),
      ...getFolders(),
      ...getShortcuts(),
      ..._.chain([
        // Applications can live in multiple locations on macOS
        // Source: https://unix.stackexchange.com/a/583843
        ...getApplications("/Applications"),
        ...getApplications("/Applications/Utilities"),
        ...getApplications("/System/Applications"),
        ...getApplications("/System/Applications/Utilities"),
      ])
        .sortBy(commandComparator)
        .sortBy(applicationComparator)
        .value(),
      ...getSystemCommands(),
      ...getSystemPreferences(),
      ...getCommandsFromFallbackHandler(),
    ];

    return allCommands;
  } finally {
    console.timeEnd("getAllCommands");
  }
};

const INCALCULABLE = Symbol("incalculable");

const calculate = (input) => {
  try {
    const script = new vm.Script(input);
    const result = script.runInNewContext();
    console.log(`Calculated ${input} as ${result}`);
    return result;
  } catch {
    return INCALCULABLE;
  }
};

const didCalculate = (result) => result !== INCALCULABLE;

const ENTER = "{ENTER}";

const stripKeystrokes = (text) =>
  text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;

var pressEnter = async () => {
  console.log("pressEnter");
  await delay(1000);
  await keyboard.pressKey(Key.Enter);
  await delay(10);
  await keyboard.releaseKey(Key.Enter);
};

const showCommandErrorDialog = async (commandFilename, error) => {
  const result = await cocoaDialog("msgbox", {
    title: `Error in ${commandFilename}`,
    text: error.stack,
    button1: "Edit",
    button2: "Dismiss",
  });

  if (result === "1") {
    await editScript(commandFilename);
  }
};

const getConfigPath = (filename) => path.join(getConfigDir(), filename);

const processInvokeScriptResult = (result) =>
  _.isArray(result) || _.isObject(result) ? result : _.toString(result);

const wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;

const invokeScript = async (commandFilename, selection) => {
  const require = createRequire(commandFilename);

  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });

  const commandContext = {
    _,
    selection,
    require,
    console,
    open,
    get: axios.get,
    post: axios.post,
    put: axios.put,
    patch: axios.patch,
    delete: axios.delete,
    ENV,
    ENTER,
  };

  try {
    const commandSource = fs$1.readFileSync(commandFilename, "utf8");

    const wrappedCommandSource = wrapCommandSource(commandSource);

    const commandScript = new vm.Script(wrappedCommandSource);

    const result = await commandScript.runInNewContext(commandContext);

    if (!_.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};

const showCalculationResultDialog = async (query, result) => {
  const cwd = path__default.join(os$1.homedir(), "Tools", "quickulator", "app");
  const target = path__default.join(cwd, "dist", "quickulator");

  try {
    await execa(target, [...query], { cwd, preferLocal: true });
  } catch (error) {
    console.error(`Failed to show calculation result`, error);
  }
};

var showPrompt = async () => {
  const selection = await getCurrentSelection();

  const commands = getAllCommands();

  const item = await prompt(commands);

  let result;

  const require = createRequire(import.meta.url);
  Object.assign(global, { open, require });

  const commandContext = {
    open,
    ENTER,
  };

  // Execute built-in command
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  }
  // Handle built-in functions
  else if (_.isFunction(item.value)) {
    result = item.value(selection);
  }
  // Invoke
  else if (_.isFunction(item.invoke)) {
    await item.invoke();
  }
  // Unhandled command:
  // 1. attempt to treat as a calculation
  // 2. defer to the fallback handler, if it exists
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    // Attempt to calculate
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      result = String(calculated);
      await showCalculationResultDialog(item.query);
    }
    // Execute default handler
    else {
      const commandFilename = getCommandFilename$1("fallback-handler.js");

      try {
        const fallbackHandler = require(commandFilename);

        const result = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );

        if (!_.isUndefined(result)) {
          result = processInvokeScriptResult(result);
        }
      } catch (e) {
        console.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  // Execute custom module-based command
  else {
    const commandFilename = getCommandFilename$1(item.value);

    result = await invokeScript(commandFilename, selection);
  }

  if (result && _.isString(result)) {
    console.log(`Result: ${result}`);
    // Update to reflect the command execution result
    await setClipboardContent(stripKeystrokes(result));

    if (result.endsWith(ENTER)) {
      await pressEnter();
    }

    return true;
  } else if (result && _.isObject(result) && "shortcut" in result) {
    const { shortcut, input } = result;
    try {
      await execaSync("shortcuts", ["run", shortcut, "-i", input]);
    } catch (error) {
      console.error(`Failed to run shortcut: ${error.message}`);
    }
  }

  return false;
};

const SOCKET_FILE = "/tmp/meta-x.socket";

const createServer = (socket, onMessage) => {
  const server = net
    .createServer((stream) => {
      stream.on("data", (buffer) => {
        const message = buffer.toString();
        try {
          onMessage(message);
        } catch (error) {
          console.error(
            `Error encountered while handling message "${message}"`,
            error
          );
        }
      });
    })
    .listen(socket);

  return server;
};

const listen = (onMessage) => {
  // Remove any stale socket file
  const lockExists = fs$1.existsSync(SOCKET_FILE);
  if (lockExists) {
    fs$1.unlinkSync(SOCKET_FILE);
  }

  const server = createServer(SOCKET_FILE, onMessage);

  const cleanup = () => {
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
};

const spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots",
});

const run = async () => {
  spinner.stop();

  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await showPrompt();
  if (result) {
    await finishClipboard();
  }

  spinner.start();
};

listen((message) => {
  if (message.trim() === "run") {
    run();
  } else {
    console.log(`Unknown message: "${message}"`);
  }
});

notifier.notify({
  title: "META-x",
  message: "META-x is ready",
});

spinner.start();
