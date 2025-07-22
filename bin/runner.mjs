// src/runner.ts
import _20 from "lodash";
import ora from "ora";

// src/clipboard/finish/darwin.ts
import { keyboard, Key } from "@nut-tree-fork/nut-js";

// src/utils/delay.ts
var delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

// src/clipboard/finish/darwin.ts
var darwin_default = async () => {
  await delay(20);
  await keyboard.type(Key.LeftSuper, Key.V);
};

// src/clipboard/finish/index.ts
var finish_default = () => process.platform === "darwin" ? darwin_default() : Promise.resolve();

// src/state/clipboardHistory.ts
import _ from "lodash";

// src/utils/isProbablyPassword.ts
var isProbablyPassword = (text) => {
  const hasUpperCase = /[A-Z]/.test(text);
  const hasLowerCase = /[a-z]/.test(text);
  const hasDigit = /\d/.test(text);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(text);
  let score = 0;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasDigit) score++;
  if (hasSpecialChar) score++;
  return score >= 3 && !text.startsWith("https://");
};

// src/state/clipboardHistory.ts
var clipboardHistory = [];
var updateClipboardHistory = (entry) => {
  if (!isProbablyPassword(entry) && entry.length > 1) {
    clipboardHistory = _.take(_.uniq([entry, ...clipboardHistory]), 10);
  }
};
var getClipboardHistory = () => clipboardHistory;

// src/clipboard/utils.ts
import _2 from "lodash";
import clipboard from "clipboardy";

// src/utils/logger.ts
import chalk from "chalk";
var logger = {
  ...console,
  log: (...args) => {
    const [first, ...rest] = args;
    console.log(
      chalk.grey(`\u2699\uFE0E`),
      chalk.grey(first),
      ...rest.map((arg) => arg.toString())
    );
  },
  warn: (...args) => {
    const [first, ...rest] = args;
    console.warn(
      chalk.yellow(`\u26A0\uFE0E`),
      chalk.yellow(first),
      ...rest.map((arg) => arg.toString())
    );
  },
  error: (...args) => {
    const [first, ...rest] = args;
    console.error(`\u2297`, chalk.red(first), ...rest.map((arg) => arg.toString()));
  }
};

// src/utils/clock.ts
var clock = (label, work) => (...args) => {
  try {
    logger.time(label);
    const result = work(...args);
    return result;
  } finally {
    logger.timeEnd(label);
  }
};

// src/clipboard/utils.ts
var getCurrentSelection = clock("getCurrentSelection", async () => {
  return clipboard.read();
});
var setClipboardContent = clock(
  "setClipboardContent",
  async (contentAsText) => {
    if (_2.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  }
);
var getClipboardContent = async () => {
  return clipboard.read();
};

// src/clipboard/prepare/darwin.ts
import { keyboard as keyboard2, Key as Key2 } from "@nut-tree-fork/nut-js";
var darwin_default2 = clock("prepare", async () => {
  await keyboard2.type(Key2.LeftSuper, Key2.C);
  await delay(20);
});

// src/clipboard/prepare/index.ts
var prepare_default = async () => {
  updateClipboardHistory(await getClipboardContent());
  return process.platform === "darwin" ? darwin_default2() : Promise.resolve();
};

// src/constants.ts
var TITLE = "META-x";

// src/ipc.ts
import net from "node:net";
import fs from "node:fs";
var SOCKET_FILE = "/tmp/meta-x.socket";
var createServer = (socket, onMessage) => {
  const server = net.createServer((stream) => {
    stream.on("data", (buffer) => {
      const message = buffer.toString();
      try {
        onMessage(message);
      } catch (error) {
        logger.error(
          `Error encountered while handling message "${message}"`,
          error
        );
      }
    });
  }).listen(socket);
  return server;
};
var listen = (onMessage) => {
  const lockExists = fs.existsSync(SOCKET_FILE);
  if (lockExists) {
    fs.unlinkSync(SOCKET_FILE);
  }
  const server = createServer(SOCKET_FILE, onMessage);
  const cleanup = () => {
    server.close();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
};

// src/utils/getAllCommands.ts
import _14 from "lodash";
import { createRequire as createRequire2 } from "node:module";

// src/catalog/applications.ts
import fs3 from "fs";
import _4 from "lodash";
import { openApp } from "open";
import path3 from "path";

// src/utils/getConfigDir.ts
import os from "os";
import path from "path";
var getConfigDir = (...subdirs) => path.join(os.homedir(), ".meta-x", ...subdirs);
var SCRIPTS_DIR = getConfigDir("scripts");

// src/utils/getConfigOption.ts
import JSON5 from "json5";
import _3 from "lodash";
import fs2 from "node:fs";

// src/utils/getConfigPath.ts
import * as path2 from "node:path";
var getConfigPath = (filename) => path2.join(getConfigDir(), filename);

// src/utils/getConfigOption.ts
var CONFIG_FILENAME = getConfigPath("config.json");
var getConfigOption = (key, defaultValue) => {
  try {
    const contents = fs2.readFileSync(CONFIG_FILENAME, "utf8");
    const json = JSON5.parse(contents);
    return _3.get(json, key, defaultValue);
  } catch {
    return defaultValue;
  }
};

// src/catalog/_constants.ts
var SCRIPT_PREFIX = "\u0192\u0578";
var SNIPPET_PREFIX = "->";
var MANAGE_SCRIPTS_PREFIX = "\u2425";
var MANAGE_SNIPPETS_PREFIX = "\u2425";
var FOLDER_PREFIX = "\u2302";
var APPLICATION_PREFIX = "\u232C";
var SYSTEM_PREFIX = "\u2699\uFE0E";
var SHORTCUT_PREFIX = "\u2318";

// src/catalog/applications.ts
var getApplicationUsageHistory = () => path3.join(getConfigDir(), ".application-usage");
var persistApplicationUsage = (values) => {
  fs3.writeFileSync(
    getApplicationUsageHistory(),
    _4.takeRight(values, 100).join("\n"),
    "utf8"
  );
};
var restoreApplicationUsage = () => {
  try {
    return fs3.readFileSync(getApplicationUsageHistory(), "utf8").split("\n");
  } catch {
    return [];
  }
};
var trackApplicationUsage = (value) => {
  const history = restoreApplicationUsage();
  persistApplicationUsage([...history, value]);
};
var DEFAULT_IGNORED = [];
var getApplications = (rootDir = "/Applications") => {
  const history = restoreApplicationUsage();
  const scores = _4.countBy(history, _4.identity);
  const ignored = getConfigOption("ignored", DEFAULT_IGNORED);
  const applications = fs3.readdirSync(rootDir).filter((filename) => {
    const pathname = path3.join(rootDir, filename);
    const stats = fs3.statSync(pathname);
    if (stats.isDirectory() && !filename.endsWith(".app")) {
      return false;
    }
    try {
      fs3.accessSync(pathname, fs3.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }).filter((filename) => !filename.startsWith(".")).filter((filename) => !ignored.some((ignore) => filename.includes(ignore)));
  const items = applications.map((application) => {
    const value = path3.join(rootDir, application);
    const name = _4.get(path3.parse(application), "name", application);
    return {
      title: `${APPLICATION_PREFIX} ${name}`,
      value,
      score: scores[value] ?? 0,
      invoke: async () => {
        logger.log(`Opening ${application}`);
        trackApplicationUsage(value);
        await openApp(value);
      }
    };
  });
  return items;
};

// src/catalog/built-ins.ts
import _5 from "lodash";
var BUILT_IN_COMMANDS = {
  "Camel Case": _5.camelCase,
  "Kebab Case": _5.kebabCase,
  "Snake Case": _5.snakeCase,
  "Start Case": _5.startCase,
  "Title Case": _5.startCase,
  "To Lower": _5.toLower,
  "To Upper": _5.toUpper,
  Capitalize: _5.capitalize,
  "Sentence Case": _5.capitalize,
  Deburr: _5.deburr,
  "Sort Lines": (selection) => _5.chain(selection).split("\n").sort().join("\n").value(),
  "Reverse Lines": (selection) => _5.chain(selection).split("\n").reverse().join("\n").value()
};
var getBuiltInCommands = () => _5.map(BUILT_IN_COMMANDS, (command, name) => ({
  label: name,
  title: `${SCRIPT_PREFIX} ${name}`,
  value: command
}));

// src/utils/getCommandFilename.ts
import path4 from "node:path";
var getCommandFilename = (commandFilename) => path4.join(SCRIPTS_DIR, commandFilename);

// src/catalog/folders.ts
import os2 from "os";
import path5 from "path";
import open, { openApp as openApp2 } from "open";
var FOLDERS = [
  "Finder",
  "Applications",
  "Documents",
  "Downloads",
  "Home",
  "Pictures",
  "Workspace"
];
var getFolders = () => FOLDERS.map((folder) => ({
  title: `${FOLDER_PREFIX} ${folder}`,
  value: folder,
  invoke: async () => {
    if (folder === "Finder") {
      await openApp2("Finder");
    } else if (folder === "Applications") {
      await open("/Applications");
    } else if (folder === "Home") {
      await open(os2.homedir());
    } else {
      const dirname = path5.join(os2.homedir(), folder);
      await open(dirname);
    }
  }
}));

// src/catalog/manage.ts
import fs4 from "node:fs";
if (!fs4.existsSync(SCRIPTS_DIR)) {
  fs4.mkdirSync(SCRIPTS_DIR, { recursive: true });
}
var getManageCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Reload`,
    invoke: async () => {
      rebuildCatalog();
    }
  }
];

// src/catalog/manage-scripts.ts
import cocoaDialog from "cocoa-dialog";
import _6 from "lodash";
import fs7 from "node:fs";
import open2 from "open";

// src/utils/createEmptyScript.ts
import fs5 from "node:fs";

// src/utils/getPathnameWithExtension.ts
var getPathnameWithExtension = (pathname, extension = ".js") => pathname.endsWith(extension) ? pathname : `${pathname}${extension}`;

// src/utils/createEmptyScript.ts
var TEMPLATE = `
module.exports = (selection) => {
  // \`this\` is bound to the Command Context. API documentation can be
  // found at https://github.com/calebmpeterson/META-x#command-context.

  // Modify the currently selected text and return the replacement text.
  // return selection.toUpperCase();

  // Or perform some other side-effect and return undefined, in which
  // case the currently selected text will not be transformed.
  // return undefined;

  // Or return a shortcut to run a macOS Shortcut with the output of the command:
  //
  // return {
  //   shortcut: "Your Shortcut",
  //   input: selection.toUpperCase(),
  // };
};
`.trim();
var createEmptyScript = (pathname) => {
  const nameWithExtension = getPathnameWithExtension(pathname);
  if (!fs5.existsSync(nameWithExtension)) {
    fs5.writeFileSync(nameWithExtension, TEMPLATE, "utf8");
  }
};

// src/utils/ensureEmptyFallbackHandler.ts
import fs6 from "node:fs";
var TEMPLATE2 = `
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};

module.exports.suggestions = function () {
  // The suggestions should be an array of strings
  return ["suggestion one", "suggestion two", "suggestion three"];
};
`.trim();
var ensureEmptyFallbackHandler = () => {
  const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");
  if (!fs6.existsSync(fallbackHandlerFilename)) {
    fs6.writeFileSync(fallbackHandlerFilename, TEMPLATE2, "utf8");
  }
};

// src/utils/openInSystemEditor.ts
import { execa } from "execa";
var openInSystemEditor = async (pathname, extension = ".js") => {
  if (process.env.EDITOR) {
    await execa(process.env.EDITOR, [
      getPathnameWithExtension(pathname, extension)
    ]);
  }
};

// src/catalog/manage-scripts.ts
if (!fs7.existsSync(SCRIPTS_DIR)) {
  fs7.mkdirSync(SCRIPTS_DIR, { recursive: true });
}
var getManageScriptCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Manage Scripts`,
    invoke: async () => {
      await open2(SCRIPTS_DIR);
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Create Script`,
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Script As...",
        withDirectory: SCRIPTS_DIR
      });
      if (!_6.isEmpty(result)) {
        createEmptyScript(result);
        await openInSystemEditor(result);
      }
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Script`,
    invoke: async () => {
      const result = await cocoaDialog("fileselect", {
        title: "Choose Script To Edit...",
        withDirectory: SCRIPTS_DIR
      });
      if (!_6.isEmpty(result)) {
        await openInSystemEditor(result);
      }
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");
      ensureEmptyFallbackHandler();
      await openInSystemEditor(fallbackHandlerFilename);
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Open ${TITLE} Documentation`,
    invoke: async () => {
      await open2(`https://github.com/calebmpeterson/META-x#command-context`);
    }
  }
];

// src/catalog/manage-snippets.ts
import cocoaDialog2 from "cocoa-dialog";
import _7 from "lodash";
import fs9 from "node:fs";
import open3 from "open";

// src/utils/createEmptySnippet.ts
import fs8 from "node:fs";
var SNIPPET_EXTENSION = ".txt";
var TEMPLATE3 = ``;
var createEmptySnippet = (pathname) => {
  const nameWithExtension = getPathnameWithExtension(
    pathname,
    SNIPPET_EXTENSION
  );
  if (!fs8.existsSync(nameWithExtension)) {
    fs8.writeFileSync(nameWithExtension, TEMPLATE3, "utf8");
  }
};

// src/catalog/manage-snippets.ts
var SNIPPETS_DIR = getConfigDir("snippets");
if (!fs9.existsSync(SNIPPETS_DIR)) {
  fs9.mkdirSync(SNIPPETS_DIR, { recursive: true });
}
var getManageSnippetCommands = () => [
  {
    title: `${MANAGE_SNIPPETS_PREFIX} Create Snippet`,
    invoke: async () => {
      const result = await cocoaDialog2("filesave", {
        title: "Save Snippet As...",
        withDirectory: SNIPPETS_DIR
      });
      if (!_7.isEmpty(result)) {
        createEmptySnippet(result);
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    }
  },
  {
    title: `${MANAGE_SNIPPETS_PREFIX} Edit Snippet`,
    invoke: async () => {
      const result = await cocoaDialog2("fileselect", {
        title: "Choose Snippet To Edit...",
        withDirectory: SNIPPETS_DIR
      });
      if (!_7.isEmpty(result)) {
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    }
  },
  {
    title: `${MANAGE_SNIPPETS_PREFIX} Manage Snippets`,
    invoke: async () => {
      await open3(SNIPPETS_DIR);
    }
  }
];

// src/catalog/scripts.ts
import fs11 from "fs";

// src/utils/getCommandTitle.ts
import { basename } from "node:path";
var getCommandTitle = (commandFilename) => basename(commandFilename, ".js");

// src/utils/invokeScript.ts
import _12 from "lodash";
import fs10 from "node:fs";
import vm from "node:vm";

// src/utils/createScriptContext.ts
import _9 from "lodash";
import axios from "axios";
import dotenv from "dotenv";
import open4 from "open";

// src/keystrokes/constants.ts
var ENTER = "{ENTER}";

// src/utils/choose.ts
import { exec } from "child_process";
import _8 from "lodash";

// src/utils/getFontName.ts
var getFontName = () => "Fira Code";

// src/utils/choose.ts
var choose = (items, options = {}) => new Promise((resolve) => {
  const choices = items.join("\n");
  const toShow = Math.max(5, Math.min(40, _8.size(items)));
  const outputConfig = [
    options.returnIndex ? "-i" : "",
    options.placeholder ? `-p "${options.placeholder}"` : ""
  ].join(" ");
  const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s 16 -m -n ${toShow} ${outputConfig}`;
  exec(cmd, (error, stdout, stderr) => {
    if (stdout) {
      const selection = _8.trim(stdout);
      if (options.returnIndex && selection === "-1") {
        resolve(void 0);
      }
      resolve(selection);
    } else {
      if (error && process.env.NODE_ENV === "development") {
        logger.error(error.stack);
      }
      resolve(void 0);
    }
  });
});

// src/utils/createScriptContext.ts
import { createRequire } from "module";
import { execa as execa2, $ } from "execa";
import { runAppleScript } from "run-applescript";

// src/utils/showNotification.ts
import notifier from "node-notifier";
var showNotification = ({ message }) => {
  notifier.notify({
    title: TITLE,
    message
  });
};

// src/utils/createScriptContext.ts
var createScriptContext = (commandFilename, selection) => {
  const require2 = createRequire(commandFilename);
  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });
  const commandContext = {
    _: _9,
    selection,
    require: require2,
    console,
    open: open4,
    get: axios.get,
    post: axios.post,
    put: axios.put,
    patch: axios.patch,
    delete: axios.delete,
    ENV,
    ENTER,
    execa: execa2,
    $,
    osascript: runAppleScript,
    choose,
    notify: showNotification,
    setTimeout
  };
  return commandContext;
};

// src/utils/processInvokeScriptResult.ts
import _10 from "lodash";
var processInvokeScriptResult = (result) => _10.isArray(result) || _10.isObject(result) ? result : _10.toString(result);

// src/utils/showCommandErrorDialog.ts
import cocoaDialog3 from "cocoa-dialog";
import _11 from "lodash";
var showCommandErrorDialog = async (commandFilename, error) => {
  if (_11.isError(error)) {
    const result = await cocoaDialog3("textbox", {
      title: `Error in ${commandFilename}`,
      text: error.stack,
      height: 200,
      width: 600,
      button1: "Edit",
      button2: "Dismiss"
    });
    if (result === "1") {
      await openInSystemEditor(commandFilename);
    }
  }
};

// src/utils/invokeScript.ts
var wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;
var invokeScript = async (commandFilename, selection) => {
  console.log(`Invoking ${commandFilename}`);
  const commandContext = createScriptContext(commandFilename, selection);
  const timeoutId = setTimeout(() => {
    showNotification({
      message: `Meta-x is still invoking ${getCommandTitle(commandFilename)}`
    });
  }, 5e3);
  try {
    const commandSource = fs10.readFileSync(commandFilename, "utf8");
    const wrappedCommandSource = wrapCommandSource(commandSource);
    const commandScript = new vm.Script(wrappedCommandSource);
    const result = await commandScript.runInNewContext(commandContext);
    if (!_12.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error) {
    logger.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  } finally {
    clearTimeout(timeoutId);
  }
};

// src/catalog/scripts.ts
var getScriptCommands = () => fs11.readdirSync(SCRIPTS_DIR).filter(
  (file) => file.endsWith(".js") && !file.includes("fallback-handler")
).map((command) => ({
  title: `${SCRIPT_PREFIX} ${getCommandTitle(command)}`,
  invoke: async (selection) => {
    const commandFilename = getCommandFilename(command);
    return invokeScript(commandFilename, selection);
  }
}));

// src/catalog/shortcuts.ts
import { execaSync } from "execa";
import _13 from "lodash";
var getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"]).stdout.split("\n").filter(Boolean).map((shortcut) => {
      return {
        title: `${SHORTCUT_PREFIX} ${shortcut}`,
        invoke: async () => {
          try {
            execaSync("shortcuts", ["run", shortcut]);
          } catch (error) {
            if (_13.isError(error)) {
              logger.error(`Failed to run shortcut: ${error.message}`);
            }
          }
        }
      };
    });
    return shortcuts;
  } catch (error) {
    if (_13.isError(error)) {
      logger.error(`Failed to get shortcuts: ${error.message}`);
    }
    return [];
  }
};

// src/catalog/snippets.ts
import fs12 from "fs";
import path7 from "path";

// src/utils/getSnippetFilename.ts
import path6 from "node:path";
var getSnippetFilename = (snippetFilename) => path6.join(getConfigDir("snippets"), snippetFilename);

// src/catalog/snippets.ts
var getSnippetCommands = () => fs12.readdirSync(getConfigDir("snippets")).filter((file) => file.endsWith(SNIPPET_EXTENSION)).map((command) => ({
  title: `${SNIPPET_PREFIX} ${path7.basename(command, SNIPPET_EXTENSION)}`,
  invoke: async (_selection) => {
    const snippetFilename = getSnippetFilename(command);
    const snippet = fs12.readFileSync(snippetFilename, "utf-8");
    return snippet;
  }
}));

// src/catalog/system.ts
import { execa as execa3 } from "execa";
var getSystemCommands = () => [
  {
    title: `${SYSTEM_PREFIX} Shutdown`,
    invoke: async () => {
      await execa3("pmset", ["halt"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Restart`,
    invoke: async () => {
      await execa3("pmset", ["restart"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Sleep`,
    invoke: async () => {
      await execa3("pmset", ["sleepnow"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Sleep Displays`,
    invoke: async () => {
      await execa3("pmset", ["displaysleepnow"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} About This Mac`,
    invoke: async () => {
      await execa3("open", ["-a", "About This Mac"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Lock Displays`,
    invoke: async () => {
      await execa3("open", [
        "-a",
        "/System/Library/CoreServices/ScreenSaverEngine.app"
      ]);
    }
  }
];

// src/catalog/system-preferences.ts
import fs13 from "node:fs";
import path8 from "node:path";
import open5 from "open";
var PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";
var DEFAULT_IGNORED2 = [];
var getPreferencePanes = () => {
  const ignored = getConfigOption("ignored", DEFAULT_IGNORED2);
  return fs13.readdirSync(PREFERENCE_PANE_ROOT_DIR).map((filename) => path8.parse(filename).name).filter((filename) => !ignored.some((ignore) => filename.includes(ignore)));
};
var getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;
var getSystemPreferences = () => getPreferencePanes().map((pane) => ({
  title: `${SYSTEM_PREFIX} ${pane}`,
  value: pane,
  invoke: async () => {
    await open5(getPane(pane));
  }
}));

// src/utils/getAllCommands.ts
var getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename("fallback-handler.js");
  try {
    const require2 = createRequire2(import.meta.url);
    const fallbackHandler = require2(commandFilename);
    const fallbackCommands = fallbackHandler.suggestions && fallbackHandler.suggestions.call();
    return fallbackCommands.map((fallbackCommand) => ({
      label: fallbackCommand,
      title: fallbackCommand,
      value: fallbackCommand,
      isFallback: true
    }));
  } catch (e) {
    if (_14.isError(e)) {
      logger.error(`Failed to run fallback handler: ${e.message}`);
    }
    return [];
  }
};
var commandComparator = ({ title }) => title;
var applicationComparator = ({ score }) => -score;
var getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._14.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getSnippetCommands(),
    ...getManageSnippetCommands(),
    ...getManageCommands(),
    ...getFolders(),
    ...getShortcuts(),
    ..._14.chain([
      // Applications can live in multiple locations on macOS
      // Source: https://unix.stackexchange.com/a/583843
      ...getApplications("/Applications"),
      ...getApplications("/Applications/Utilities"),
      ...getApplications("/System/Applications"),
      ...getApplications("/System/Applications/Utilities")
    ]).sortBy(commandComparator).sortBy(applicationComparator).value(),
    ...getSystemCommands(),
    ...getSystemPreferences(),
    ...getCommandsFromFallbackHandler()
  ];
  return allCommands;
});

// src/state/commands.ts
var commandsState = [];
var getCommandsCatalog = () => commandsState;
var setCommandsCatalog = (newCommandsState) => {
  commandsState = newCommandsState;
};

// src/state/rebuildCatalog.ts
var rebuildCatalog = () => {
  logger.clear();
  logger.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};

// src/ui/clipboard-history/index.ts
import _15 from "lodash";
var formatHistoryEntry = (entry) => {
  const firstLine = entry.includes("\n") ? _15.truncate(
    entry.split("\n").find((line) => !_15.isEmpty(line)),
    { length: 50 }
  ) : _15.truncate(entry, { length: 50 });
  return _15.trim(firstLine);
};
var runClipboardHistory = async () => {
  const history = getClipboardHistory();
  const historyItems = _15.map(history, (entry) => formatHistoryEntry(entry));
  const index = await choose(historyItems, {
    returnIndex: true,
    placeholder: "Clipboard history"
  });
  if (index) {
    const indexAsNumber = parseInt(index, 10);
    const selection = history[indexAsNumber];
    if (selection) {
      await setClipboardContent(selection);
      await finish_default();
    }
  }
};

// src/ui/main.ts
import _19 from "lodash";
import open6 from "open";

// src/keystrokes/pressEnter.ts
import { keyboard as keyboard3, Key as Key3 } from "@nut-tree-fork/nut-js";
var pressEnter_default = async () => {
  await delay(1e3);
  await keyboard3.pressKey(Key3.Enter);
  await delay(10);
  await keyboard3.releaseKey(Key3.Enter);
};

// src/ui/prompt/darwin.ts
import { exec as exec2 } from "child_process";
import _16 from "lodash";
var darwin_default3 = (commands) => new Promise((resolve, reject) => {
  const choices = commands.map(({ title }) => title).join("\n");
  const toShow = Math.min(30, _16.size(commands));
  const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s 16 -m -n ${toShow} -p "Run a command or open an application"`;
  exec2(cmd, (error, stdout, stderr) => {
    if (stdout) {
      const query = _16.trim(stdout);
      const rawQueryCommand = {
        isUnhandled: true,
        query
      };
      const command = commands.find(
        ({ title, isFallback }) => title === query && !isFallback
      ) || rawQueryCommand;
      resolve(command);
    } else {
      if (error && process.env.NODE_ENV === "development") {
        logger.error(error.stack);
      }
      resolve({
        isUnknown: true
      });
    }
  });
});

// src/ui/prompt/index.ts
var prompt_default = (commands) => darwin_default3(commands);

// src/utils/calculate.ts
import vm2 from "node:vm";
var INCALCULABLE = Symbol("incalculable");
var calculate = (input) => {
  try {
    const script = new vm2.Script(input);
    const result = script.runInNewContext();
    logger.log(`Calculated ${input} as ${result}`);
    return result;
  } catch {
    return INCALCULABLE;
  }
};
var didCalculate = (result) => result !== INCALCULABLE;

// src/ui/main.ts
import { createRequire as createRequire3 } from "module";

// src/utils/showCalculationResultDialog.ts
import { execa as execa4 } from "execa";
import os3 from "node:os";
import path9 from "node:path";
var showCalculationResultDialog = async (query, result) => {
  const cwd = path9.join(os3.homedir(), "Tools", "quickulator", "app");
  const target = path9.join(cwd, "dist", "quickulator");
  try {
    await execa4(target, [query], { cwd, preferLocal: true });
  } catch (error) {
    logger.error(`Failed to show calculation result`, error);
  }
};

// src/utils/stripKeystrokes.ts
var stripKeystrokes = (text) => text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;

// src/utils/isShortcutResult.ts
import _17 from "lodash";
var isShortcutResult = (result) => Boolean(result) && _17.isObject(result) && "shortcut" in result && _17.isString(result.shortcut);

// src/utils/invokeShortcut.ts
import { execa as execa5 } from "execa";
import _18 from "lodash";
var invokeShortcut = async ({ shortcut, input }) => {
  try {
    await execa5("shortcuts", ["run", shortcut, "-i", input ?? ""]);
  } catch (error) {
    if (_18.isError(error)) {
      logger.error(`Failed to run shortcut: ${error.message}`);
    } else {
      logger.error(`Failed to run shortcut: ${shortcut}`);
    }
  }
};

// src/ui/main.ts
var main_default = async () => {
  const selection = await getCurrentSelection();
  const commands = getCommandsCatalog();
  const item = await prompt_default(commands);
  let result;
  const require2 = createRequire3(import.meta.url);
  Object.assign(global, { open: open6, require: require2 });
  if ("isUnknown" in item) {
    logger.warn(`Unknown command`);
  } else if ("value" in item && _19.isFunction(item.value)) {
    result = item.value(selection);
  } else if ("invoke" in item && _19.isFunction(item.invoke)) {
    result = await item.invoke(selection);
  } else if ("isUnhandled" in item && item.isUnhandled) {
    logger.warn(`Unhandled command: ${item.query}`);
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      result = String(calculated);
      await showCalculationResultDialog(item.query, result);
    } else {
      const commandFilename = getCommandFilename("fallback-handler.js");
      try {
        const fallbackHandler = require2(commandFilename);
        const commandContext = createScriptContext(commandFilename, selection);
        const resultFromFallback = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );
        if (!_19.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        logger.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  if (result && _19.isString(result)) {
    logger.log(`Result: ${result}`);
    await setClipboardContent(stripKeystrokes(result));
    if (result.endsWith(ENTER)) {
      await pressEnter_default();
    }
    return true;
  } else if (isShortcutResult(result)) {
    await invokeShortcut(result);
  }
  return false;
};

// src/runner.ts
logger.clear();
var spinner = ora({
  text: "Ready",
  spinner: "dots"
});
var promptForAndRunCommand = async () => {
  spinner.stop();
  try {
    logger.clear();
    logger.log("Meta-x triggered");
    await prepare_default();
    const result = await main_default();
    if (result) {
      await finish_default();
    }
  } catch (error) {
    logger.error(error);
    if (_20.isError(error)) {
      showNotification({
        message: "META-x encountered an error: " + error.message
      });
    }
  } finally {
    spinner.start();
  }
};
rebuildCatalog();
setInterval(async () => {
  spinner.stop();
  rebuildCatalog();
  spinner.start();
}, 1e3 * 60);
setInterval(async () => {
  updateClipboardHistory(await getClipboardContent());
}, 250);
listen((message) => {
  if (message.trim() === "run") {
    promptForAndRunCommand();
  } else if (message.trim() === "clipboard-history") {
    runClipboardHistory();
  } else {
    logger.log(`Unknown message: "${message}"`);
  }
});
showNotification({
  message: `${TITLE} is ready`
});
spinner.start();
