// src/runner.ts
import ora from "ora";
import notifier from "node-notifier";

// src/clipboard/prepare/darwin.ts
import { keyboard, Key } from "@nut-tree/nut-js";

// src/utils/delay.ts
var delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

// src/utils/clock.ts
var clock = (label, work) => (...args) => {
  try {
    console.time(label);
    const result = work(...args);
    return result;
  } finally {
    console.timeEnd(label);
  }
};

// src/clipboard/prepare/darwin.ts
var darwin_default = clock("prepare", async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
});

// src/clipboard/prepare/index.ts
var prepare_default = () => process.platform === "darwin" ? darwin_default() : Promise.resolve();

// src/clipboard/finish/darwin.ts
import { keyboard as keyboard2, Key as Key2 } from "@nut-tree/nut-js";
var darwin_default2 = async () => {
  await delay(20);
  await keyboard2.type(Key2.LeftSuper, Key2.V);
};

// src/clipboard/finish/index.ts
var finish_default = () => process.platform === "darwin" ? darwin_default2() : Promise.resolve();

// src/ui/main.ts
import _6 from "lodash";
import open from "open";

// src/keystrokes/pressEnter.ts
import { keyboard as keyboard3, Key as Key3 } from "@nut-tree/nut-js";
var pressEnter_default = async () => {
  await delay(1e3);
  await keyboard3.pressKey(Key3.Enter);
  await delay(10);
  await keyboard3.releaseKey(Key3.Enter);
};

// src/ui/prompt/darwin.ts
import { exec } from "child_process";
import _ from "lodash";

// src/utils/getFontName.ts
var getFontName = () => "Fira Code";

// src/ui/prompt/darwin.ts
var darwin_default3 = (commands) => new Promise((resolve, reject) => {
  const choices = commands.map(({ title }) => title).join("\n");
  const toShow = Math.min(30, _.size(commands));
  const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s 16 -m -n ${toShow} -p "Run a command or open an application"`;
  exec(cmd, (error, stdout, stderr) => {
    if (stdout) {
      const query = _.trim(stdout);
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
        console.error(error.stack);
      }
      resolve({
        isUnknown: true
      });
    }
  });
});

// src/ui/prompt/index.ts
var prompt_default = (commands) => darwin_default3(commands);

// src/keystrokes/constants.ts
var ENTER = "{ENTER}";

// src/utils/calculate.ts
import vm from "node:vm";
var INCALCULABLE = Symbol("incalculable");
var calculate = (input) => {
  try {
    const script = new vm.Script(input);
    const result = script.runInNewContext();
    console.log(`Calculated ${input} as ${result}`);
    return result;
  } catch {
    return INCALCULABLE;
  }
};
var didCalculate = (result) => result !== INCALCULABLE;

// src/ui/main.ts
import { createRequire } from "module";

// src/utils/getCommandFilename.ts
import path2 from "node:path";

// src/utils/getConfigDir.ts
import os from "os";
import path from "path";
var getConfigDir = (...subdirs) => path.join(os.homedir(), ".meta-x", ...subdirs);

// src/utils/getCommandFilename.ts
var getCommandFilename = (commandFilename) => path2.join(getConfigDir(), commandFilename);

// src/state/commands.ts
var commandsState = [];
var getCommandsCatalog = () => commandsState;
var setCommandsCatalog = (newCommandsState) => {
  commandsState = newCommandsState;
};

// src/clipboard/utils.ts
import _2 from "lodash";
import clipboard from "clipboardy";
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

// src/utils/processInvokeScriptResult.ts
import _3 from "lodash";
var processInvokeScriptResult = (result) => _3.isArray(result) || _3.isObject(result) ? result : _3.toString(result);

// src/utils/showCalculationResultDialog.ts
import { execa } from "execa";
import os2 from "node:os";
import path3 from "node:path";
var showCalculationResultDialog = async (query, result) => {
  const cwd = path3.join(os2.homedir(), "Tools", "quickulator", "app");
  const target = path3.join(cwd, "dist", "quickulator");
  try {
    await execa(target, [query], { cwd, preferLocal: true });
  } catch (error) {
    console.error(`Failed to show calculation result`, error);
  }
};

// src/utils/stripKeystrokes.ts
var stripKeystrokes = (text) => text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;

// src/utils/isShortcutResult.ts
import _4 from "lodash";
var isShortcutResult = (result) => Boolean(result) && _4.isObject(result) && "shortcut" in result && _4.isString(result.shortcut);

// src/utils/invokeShortcut.ts
import { execa as execa2 } from "execa";
import _5 from "lodash";
var invokeShortcut = async ({ shortcut, input }) => {
  try {
    await execa2("shortcuts", ["run", shortcut, "-i", input ?? ""]);
  } catch (error) {
    if (_5.isError(error)) {
      console.error(`Failed to run shortcut: ${error.message}`);
    } else {
      console.error(`Failed to run shortcut: ${shortcut}`);
    }
  }
};

// src/ui/main.ts
var main_default = async () => {
  const selection = await getCurrentSelection();
  const commands = getCommandsCatalog();
  const item = await prompt_default(commands);
  let result;
  const require2 = createRequire(import.meta.url);
  Object.assign(global, { open, require: require2 });
  const commandContext = {
    open,
    ENTER
  };
  if ("isUnknown" in item) {
    console.warn(`Unknown command`);
  } else if ("value" in item && _6.isFunction(item.value)) {
    result = item.value(selection);
  } else if ("invoke" in item && _6.isFunction(item.invoke)) {
    result = await item.invoke(selection);
  } else if ("isUnhandled" in item && item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      result = String(calculated);
      await showCalculationResultDialog(item.query, result);
    } else {
      const commandFilename = getCommandFilename("fallback-handler.js");
      try {
        const fallbackHandler = require2(commandFilename);
        const resultFromFallback = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );
        if (!_6.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        console.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  if (result && _6.isString(result)) {
    console.log(`Result: ${result}`);
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
        console.error(
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
import _16 from "lodash";
import { createRequire as createRequire3 } from "node:module";

// src/catalog/built-ins.ts
import _7 from "lodash";

// src/catalog/_constants.ts
var SCRIPT_PREFIX = "\u0192\u0578";
var SNIPPET_PREFIX = "->";
var MANAGE_SCRIPTS_PREFIX = "\u2425";
var MANAGE_SNIPPETS_PREFIX = "\u2425";
var FOLDER_PREFIX = "\u2302";
var APPLICATION_PREFIX = "\u232C";
var SYSTEM_PREFIX = "\u2699\uFE0E";
var SHORTCUT_PREFIX = "\u2318";

// src/catalog/built-ins.ts
var BUILT_IN_COMMANDS = {
  "Camel Case": _7.camelCase,
  "Kebab Case": _7.kebabCase,
  "Snake Case": _7.snakeCase,
  "Start Case": _7.startCase,
  "Title Case": _7.startCase,
  "To Lower": _7.toLower,
  "To Upper": _7.toUpper,
  Capitalize: _7.capitalize,
  Deburr: _7.deburr,
  "Sort Lines": (selection) => _7.chain(selection).split("\n").sort().join("\n").value(),
  "Reverse Lines": (selection) => _7.chain(selection).split("\n").reverse().join("\n").value()
};
var getBuiltInCommands = () => _7.map(BUILT_IN_COMMANDS, (command, name) => ({
  label: name,
  title: `${SCRIPT_PREFIX} ${name}`,
  value: command
}));

// src/catalog/folders.ts
import os3 from "os";
import path4 from "path";
import open2, { openApp } from "open";
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
      await openApp("Finder");
    } else if (folder === "Applications") {
      await open2("/Applications");
    } else if (folder === "Home") {
      await open2(os3.homedir());
    } else {
      const dirname = path4.join(os3.homedir(), folder);
      await open2(dirname);
    }
  }
}));

// src/catalog/applications.ts
import fs2 from "fs";
import path5 from "path";
import _8 from "lodash";
import { openApp as openApp2 } from "open";
var getApplicationUsageHistory = () => path5.join(getConfigDir(), ".application-usage");
var persistApplicationUsage = (values) => {
  fs2.writeFileSync(
    getApplicationUsageHistory(),
    _8.takeRight(values, 100).join("\n"),
    "utf8"
  );
};
var restoreApplicationUsage = () => {
  try {
    return fs2.readFileSync(getApplicationUsageHistory(), "utf8").split("\n");
  } catch {
    return [];
  }
};
var trackApplicationUsage = (value) => {
  const history = restoreApplicationUsage();
  persistApplicationUsage([...history, value]);
};
var getApplications = (rootDir = "/Applications") => {
  const history = restoreApplicationUsage();
  const scores = _8.countBy(history, _8.identity);
  const applications = fs2.readdirSync(rootDir).filter((filename) => {
    const pathname = path5.join(rootDir, filename);
    const stats = fs2.statSync(pathname);
    if (stats.isDirectory() && !filename.endsWith(".app")) {
      return false;
    }
    try {
      fs2.accessSync(pathname, fs2.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }).filter((filename) => !filename.startsWith("."));
  const items = applications.map((application) => {
    const value = path5.join(rootDir, application);
    return {
      title: `${APPLICATION_PREFIX} ${_8.get(
        path5.parse(application),
        "name",
        application
      )}`,
      value,
      score: scores[value] ?? 0,
      invoke: async () => {
        console.log(`Opening ${application}`);
        trackApplicationUsage(value);
        await openApp2(value);
      }
    };
  });
  return items;
};

// src/catalog/system-preferences.ts
import fs3 from "node:fs";
import path6 from "node:path";
import open3 from "open";
var PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";
var getPreferencePanes = () => fs3.readdirSync(PREFERENCE_PANE_ROOT_DIR).map((filename) => path6.parse(filename).name);
var getPane = (pane) => `${PREFERENCE_PANE_ROOT_DIR}/${pane}.prefPane`;
var getSystemPreferences = () => getPreferencePanes().map((pane) => ({
  title: `${SYSTEM_PREFIX} ${pane}`,
  value: pane,
  invoke: async () => {
    await open3(getPane(pane));
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

// src/catalog/manage-scripts.ts
import cocoaDialog from "cocoa-dialog";
import _9 from "lodash";

// src/utils/createEmptyScript.ts
import fs4 from "node:fs";

// src/utils/getPathnameWithExtension.ts
var getPathnameWithExtension = (pathname, extension = ".js") => pathname.endsWith(extension) ? pathname : `${pathname}${extension}`;

// src/utils/createEmptyScript.ts
var TEMPLATE = `
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
var createEmptyScript = (pathname) => {
  const nameWithExtension = getPathnameWithExtension(pathname);
  if (!fs4.existsSync(nameWithExtension)) {
    fs4.writeFileSync(nameWithExtension, TEMPLATE, "utf8");
  }
};

// src/utils/openInSystemEditor.ts
import { execa as execa4 } from "execa";
var openInSystemEditor = async (pathname, extension = ".js") => {
  if (process.env.EDITOR) {
    await execa4(process.env.EDITOR, [
      getPathnameWithExtension(pathname, extension)
    ]);
  }
};

// src/utils/ensureEmptyFallbackHandler.ts
import fs5 from "node:fs";
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
  if (!fs5.existsSync(fallbackHandlerFilename)) {
    fs5.writeFileSync(fallbackHandlerFilename, TEMPLATE2, "utf8");
  }
};

// src/catalog/manage-scripts.ts
var getManageScriptCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Reload Scripts`,
    invoke: async () => {
      rebuildCatalog();
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Create Script`,
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Script As...",
        withDirectory: getConfigDir()
      });
      if (!_9.isEmpty(result)) {
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
        withDirectory: getConfigDir()
      });
      if (!_9.isEmpty(result)) {
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
  }
];

// src/catalog/scripts.ts
import fs7 from "fs";
import path8 from "path";

// src/utils/invokeScript.ts
import _13 from "lodash";
import fs6 from "node:fs";
import vm2 from "node:vm";

// src/utils/createScriptContext.ts
import _11 from "lodash";
import axios from "axios";
import dotenv from "dotenv";
import open4 from "open";

// src/utils/choose.ts
import { exec as exec2 } from "child_process";
import _10 from "lodash";
var choose = (items, options = {}) => new Promise((resolve) => {
  const choices = items.join("\n");
  const toShow = Math.max(5, Math.min(40, _10.size(items)));
  const outputConfig = [
    options.returnIndex ? "-i" : "",
    options.placeholder ? `-p "${options.placeholder}"` : ""
  ].join(" ");
  const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s 16 -m -n ${toShow} ${outputConfig}`;
  exec2(cmd, (error, stdout, stderr) => {
    if (stdout) {
      const selection = _10.trim(stdout);
      if (options.returnIndex && selection === "-1") {
        resolve(void 0);
      }
      resolve(selection);
    } else {
      if (error && process.env.NODE_ENV === "development") {
        console.error(error.stack);
      }
      resolve(void 0);
    }
  });
});

// src/utils/createScriptContext.ts
import { createRequire as createRequire2 } from "module";
import { execa as execa5, $ } from "execa";

// src/utils/getConfigPath.ts
import * as path7 from "node:path";
var getConfigPath = (filename) => path7.join(getConfigDir(), filename);

// src/utils/createScriptContext.ts
import { runAppleScript } from "run-applescript";
var createScriptContext = (commandFilename, selection) => {
  const require2 = createRequire2(commandFilename);
  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });
  const commandContext = {
    _: _11,
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
    execa: execa5,
    $,
    osascript: runAppleScript,
    choose
  };
  return commandContext;
};

// src/utils/showCommandErrorDialog.ts
import cocoaDialog2 from "cocoa-dialog";
import _12 from "lodash";
var showCommandErrorDialog = async (commandFilename, error) => {
  if (_12.isError(error)) {
    const result = await cocoaDialog2("textbox", {
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
  const commandContext = createScriptContext(commandFilename, selection);
  try {
    const commandSource = fs6.readFileSync(commandFilename, "utf8");
    const wrappedCommandSource = wrapCommandSource(commandSource);
    const commandScript = new vm2.Script(wrappedCommandSource);
    const result = await commandScript.runInNewContext(commandContext);
    if (!_13.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};

// src/catalog/scripts.ts
var getScriptCommands = () => fs7.readdirSync(getConfigDir()).filter(
  (file) => file.endsWith(".js") && !file.includes("fallback-handler")
).map((command) => ({
  title: `${SCRIPT_PREFIX} ${path8.basename(command, ".js")}`,
  invoke: async (selection) => {
    const commandFilename = getCommandFilename(command);
    return invokeScript(commandFilename, selection);
  }
}));

// src/catalog/shortcuts.ts
import { execaSync } from "execa";
import _14 from "lodash";
var getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"]).stdout.split("\n").filter(Boolean).map((shortcut) => {
      return {
        title: `${SHORTCUT_PREFIX} ${shortcut}`,
        invoke: async () => {
          try {
            execaSync("shortcuts", ["run", shortcut]);
          } catch (error) {
            if (_14.isError(error)) {
              console.error(`Failed to run shortcut: ${error.message}`);
            }
          }
        }
      };
    });
    return shortcuts;
  } catch (error) {
    if (_14.isError(error)) {
      console.error(`Failed to get shortcuts: ${error.message}`);
    }
    return [];
  }
};

// src/catalog/manage-snippets.ts
import cocoaDialog3 from "cocoa-dialog";
import _15 from "lodash";
import fs9 from "node:fs";

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
      const result = await cocoaDialog3("filesave", {
        title: "Save Snippet As...",
        withDirectory: SNIPPETS_DIR
      });
      if (!_15.isEmpty(result)) {
        createEmptySnippet(result);
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    }
  },
  {
    title: `${MANAGE_SNIPPETS_PREFIX} Edit Snippet`,
    invoke: async () => {
      const result = await cocoaDialog3("fileselect", {
        title: "Choose Snippet To Edit...",
        withDirectory: SNIPPETS_DIR
      });
      if (!_15.isEmpty(result)) {
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    }
  }
];

// src/catalog/snippets.ts
import fs10 from "fs";
import path10 from "path";

// src/utils/getSnippetFilename.ts
import path9 from "node:path";
var getSnippetFilename = (snippetFilename) => path9.join(getConfigDir("snippets"), snippetFilename);

// src/catalog/snippets.ts
var getSnippetCommands = () => fs10.readdirSync(getConfigDir("snippets")).filter((file) => file.endsWith(SNIPPET_EXTENSION)).map((command) => ({
  title: `${SNIPPET_PREFIX} ${path10.basename(command, SNIPPET_EXTENSION)}`,
  invoke: async (_selection) => {
    const snippetFilename = getSnippetFilename(command);
    const snippet = fs10.readFileSync(snippetFilename, "utf-8");
    return snippet;
  }
}));

// src/utils/getAllCommands.ts
var getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename("fallback-handler.js");
  try {
    const require2 = createRequire3(import.meta.url);
    const fallbackHandler = require2(commandFilename);
    const fallbackCommands = fallbackHandler.suggestions && fallbackHandler.suggestions.call();
    return fallbackCommands.map((fallbackCommand) => ({
      label: fallbackCommand,
      title: fallbackCommand,
      value: fallbackCommand,
      isFallback: true
    }));
  } catch (e) {
    if (_16.isError(e)) {
      console.error(`Failed to run fallback handler: ${e.message}`);
    }
    return [];
  }
};
var commandComparator = ({ title }) => title;
var applicationComparator = ({ score }) => -score;
var getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._16.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getSnippetCommands(),
    ...getManageSnippetCommands(),
    ...getFolders(),
    ...getShortcuts(),
    ..._16.chain([
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

// src/state/rebuildCatalog.ts
var rebuildCatalog = () => {
  console.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};

// src/runner.ts
import _19 from "lodash";

// src/ui/clipboard-history/index.ts
import _18 from "lodash";

// src/state/clipboardHistory.ts
import _17 from "lodash";

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
  if (!isProbablyPassword(entry)) {
    clipboardHistory = _17.take(_17.uniq([entry, ...clipboardHistory]), 10);
  }
};
var getClipboardHistory = () => clipboardHistory;

// src/ui/clipboard-history/index.ts
var formatHistoryEntry = (entry) => {
  const firstLine = entry.includes("\n") ? _18.truncate(
    entry.split("\n").find((line) => !_18.isEmpty(line)),
    { length: 50 }
  ) : _18.truncate(entry, { length: 50 });
  return _18.trim(firstLine);
};
var runClipboardHistory = async () => {
  const history = getClipboardHistory();
  const historyItems = _18.map(history, (entry) => formatHistoryEntry(entry));
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

// src/runner.ts
var spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots"
});
var runCommand = async () => {
  spinner.stop();
  try {
    console.log("Meta-x triggered");
    await prepare_default();
    const result = await main_default();
    if (result) {
      await finish_default();
    }
  } catch (error) {
    console.error(error);
    if (_19.isError(error)) {
      notifier.notify({
        title: "META-x",
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
    runCommand();
  } else if (message.trim() === "clipboard-history") {
    runClipboardHistory();
  } else {
    console.log(`Unknown message: "${message}"`);
  }
});
notifier.notify({
  title: "META-x",
  message: "META-x is ready"
});
spinner.start();
