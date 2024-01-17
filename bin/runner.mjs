import { keyboard, Key } from '@nut-tree/nut-js';
import _ from 'lodash';
import { createRequire } from 'module';
import open, { openApp } from 'open';
import { exec } from 'child_process';
import clipboard from 'clipboardy';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fs$1 from 'node:fs';
import path$1 from 'node:path';
import { execa } from 'execa';
import cocoaDialog from 'cocoa-dialog';
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
    const toShow = Math.min(10, _.size(commands));
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
    title: `⌁ ${name}`,
    value: command,
  }));

const getFolders = () =>
  ["Applications", "Documents", "Downloads", "Home", "Pictures"].map(
    (folder) => ({
      title: `⏍ ${folder}`,
      value: folder,
      invoke: async () => {
        if (folder === "Applications") {
          await open("/Applications");
        } else if (folder === "Home") {
          await open(os.homedir());
        } else {
          const dirname = path.join(os.homedir(), folder);
          await open(dirname);
        }
      },
    })
  );

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

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

const getApplications = (rootDir = "/Applications") => {
  const history = restoreApplicationUsage();
  const scores = _.countBy(history, _.identity);

  const applications = fs
    .readdirSync(rootDir)
    .filter((filename) => {
      const pathname = path.join(rootDir, filename);
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
    const value = path.join(rootDir, application);
    return {
      title: `⌬ ${_.get(path.parse(application), "name", application)}`,
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
    .map((filename) => path$1.parse(filename).name);

const getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;

const getSystemPreferences = () =>
  getPreferencePanes().map((pane) => ({
    title: `⚙︎ ${pane}`,
    value: pane,
    invoke: async () => {
      await open(getPane(pane));
    },
  }));

const getSystemCommands = () => [
  {
    title: "⚙︎ Sleep",
    invoke: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: "⚙︎ Sleep Displays",
    invoke: async () => {
      await execa("pmset", ["displaysleepnow"]);
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
    title: "⌁ Create Script",
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
    title: "⌁ Edit Script",
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
    title: "⌁ Edit Fallback Handler",
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

      ensureEmptyFallbackHandler();

      await editScript(fallbackHandlerFilename);
    },
  },
];

const getCommands = () =>
  fs
    .readdirSync(getConfigDir())
    .filter(
      (file) => file.endsWith(".js") && !file.includes("fallback-handler")
    )
    .map((command) => ({
      title: `⌁ ${path.basename(command, ".js")}`,
      value: command,
    }));

const getCommandFilename$1 = (commandFilename) =>
  path.join(getConfigDir(), commandFilename);

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
        [...getCommands(), ...getBuiltInCommands()],
        commandComparator
      ),
      ...getManageScriptCommands(),
      ...getFolders(),
      ...getSystemPreferences(),
      ...getSystemCommands(),
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
      ...getCommandsFromFallbackHandler(),
    ];

    return allCommands;
  } finally {
    console.timeEnd("getAllCommands");
  }
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

var showPrompt = async () => {
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
  // Invoke
  else if (_.isFunction(item.invoke)) {
    await item.invoke();
  }
  // Execute default handler
  else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);

    const commandFilename = getCommandFilename$1("fallback-handler.js");

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
    const commandFilename = getCommandFilename$1(item.value);

    try {
      const commandModule = require(`${commandFilename}`);
      const result = commandModule.call(commandContext, selection);

      if (!_.isUndefined(result)) {
        resultAsText =
          _.isArray(result) || _.isObject(result)
            ? JSON.stringify(result, null, "  ")
            : _.toString(result);
      }
    } catch (error) {
      console.error(`Failed to execute ${commandFilename}`, error);
      await showCommandErrorDialog(commandFilename, error);
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

const run = async () => {
  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await showPrompt();
  if (result) {
    await finishClipboard();
  }
};

listen((message) => {
  if (message === "run") {
    run();
  }
});
