// src/runner.mjs
import ora from "ora";
import notifier from "node-notifier";

// src/clipboard/prepare/darwin.mjs
import { keyboard, Key } from "@nut-tree/nut-js";

// src/utils/delay.mjs
var delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

// src/utils/clock.mjs
var clock = (label, work) => (...args) => {
  try {
    console.time(label);
    const result = work(...args);
    return result;
  } finally {
    console.timeEnd(label);
  }
};

// src/clipboard/prepare/darwin.mjs
var darwin_default = clock("prepare", async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
});

// src/clipboard/prepare/index.mjs
var prepare_default = () => process.platform === "darwin" ? darwin_default() : Promise.resolve();

// src/clipboard/finish/darwin.mjs
import { keyboard as keyboard2, Key as Key2 } from "@nut-tree/nut-js";
var darwin_default2 = async () => {
  await delay(20);
  await keyboard2.type(Key2.LeftSuper, Key2.V);
};

// src/clipboard/finish/index.mjs
var finish_default = () => process.platform === "darwin" ? darwin_default2() : Promise.resolve();

// src/ui/main.mjs
import _11 from "lodash";
import { createRequire as createRequire4 } from "module";
import open4 from "open";

// src/ui/prompt/darwin.mjs
import { exec } from "child_process";
import _ from "lodash";
var darwin_default3 = (commands) => new Promise((resolve, reject) => {
  const choices = commands.map(({ title }) => title).join("\n");
  const toShow = Math.min(40, _.size(commands));
  const cmd = `echo "${choices}" | choose -b 000000 -c 222222 -w 30 -s 18 -m -n ${toShow}`;
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

// src/ui/prompt/linux.mjs
import { exec as exec2 } from "child_process";
import _2 from "lodash";
var linux_default = (commands) => new Promise((resolve, reject) => {
  const choices = commands.map(({ title }) => title).join("\n");
  const cmd = `echo "${choices}" | dmenu -i -b`;
  exec2(cmd, (error, stdout, stderr) => {
    if (stdout) {
      const query = _2.trim(stdout);
      resolve(commands.find(({ title }) => title === query));
    } else {
      if (error) {
        console.error(error);
      }
      resolve({
        isUnknown: true
      });
    }
  });
});

// src/ui/prompt/index.mjs
var prompt_default = (...args) => process.platform === "darwin" ? darwin_default3(...args) : linux_default(...args);

// src/ui/main.mjs
import { execaSync as execaSync2 } from "execa";

// src/clipboard/utils.mjs
import _3 from "lodash";
import clipboard from "clipboardy";
var exported = {
  getCurrentSelection: clock("getCurrentSelection", async () => {
    return clipboard.read();
  }),
  setClipboardContent: clock("setClipboardContent", async (contentAsText) => {
    if (_3.isString(contentAsText)) {
      await clipboard.write(contentAsText);
    }
  })
};
var { getCurrentSelection, setClipboardContent } = exported;

// src/utils/calculate.mjs
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

// src/keystrokes/constants.mjs
var ENTER = "{ENTER}";

// src/utils/stripKeystrokes.mjs
var stripKeystrokes = (text) => text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;

// src/keystrokes/pressEnter.mjs
import { keyboard as keyboard3, Key as Key3 } from "@nut-tree/nut-js";
var pressEnter_default = async () => {
  console.log("pressEnter");
  await delay(1e3);
  await keyboard3.pressKey(Key3.Enter);
  await delay(10);
  await keyboard3.releaseKey(Key3.Enter);
};

// src/utils/invokeScript.mjs
import _6 from "lodash";
import dotenv2 from "dotenv";
import fs from "node:fs";
import vm2 from "node:vm";
import { createRequire as createRequire2 } from "module";

// src/utils/createScriptContext.mjs
import { createRequire } from "module";
import _4 from "lodash";
import open from "open";
import dotenv from "dotenv";
import axios from "axios";

// src/utils/getConfigPath.mjs
import * as path2 from "node:path";

// src/utils/getConfigDir.mjs
import os from "os";
import path from "path";
var getConfigDir = () => path.join(os.homedir(), ".meta-x");

// src/utils/getConfigPath.mjs
var getConfigPath = (filename) => path2.join(getConfigDir(), filename);

// src/utils/createScriptContext.mjs
import { execa, $ } from "execa";
import { runAppleScript } from "run-applescript";
var createScriptContext = (commandFilename, selection) => {
  const require2 = createRequire(commandFilename);
  const ENV = {};
  dotenv.config({ path: getConfigPath(".env"), processEnv: ENV });
  const commandContext = {
    _: _4,
    selection,
    require: require2,
    console,
    open,
    get: axios.get,
    post: axios.post,
    put: axios.put,
    patch: axios.patch,
    delete: axios.delete,
    ENV,
    ENTER,
    execa,
    $,
    osascript: runAppleScript
  };
  return commandContext;
};

// src/utils/processInvokeScriptResult.mjs
import _5 from "lodash";
var processInvokeScriptResult = (result) => _5.isArray(result) || _5.isObject(result) ? result : _5.toString(result);

// src/utils/showCommandErrorDialog.mjs
import cocoaDialog from "cocoa-dialog";

// src/utils/editScript.mjs
import { execa as execa2 } from "execa";

// src/utils/getPathnameWithExtension.mjs
var getPathnameWithExtension = (pathname) => pathname.endsWith(".js") ? pathname : `${pathname}.js`;

// src/utils/editScript.mjs
var editScript = async (pathname) => {
  await execa2(process.env.EDITOR, [getPathnameWithExtension(pathname)]);
};

// src/utils/showCommandErrorDialog.mjs
var showCommandErrorDialog = async (commandFilename, error) => {
  const result = await cocoaDialog("msgbox", {
    title: `Error in ${commandFilename}`,
    text: error.stack,
    button1: "Edit",
    button2: "Dismiss"
  });
  if (result === "1") {
    await editScript(commandFilename);
  }
};

// src/utils/invokeScript.mjs
var wrapCommandSource = (commandSource) => `
const module = {};

${commandSource};

module.exports(selection);
`;
var invokeScript = async (commandFilename, selection) => {
  const require2 = createRequire2(commandFilename);
  const ENV = {};
  dotenv2.config({ path: getConfigPath(".env"), processEnv: ENV });
  const commandContext = createScriptContext(commandFilename, selection);
  try {
    const commandSource = fs.readFileSync(commandFilename, "utf8");
    const wrappedCommandSource = wrapCommandSource(commandSource);
    const commandScript = new vm2.Script(wrappedCommandSource);
    const result = await commandScript.runInNewContext(commandContext);
    if (!_6.isUndefined(result)) {
      return processInvokeScriptResult(result);
    }
  } catch (error) {
    console.error(`Failed to execute ${commandFilename}`, error);
    await showCommandErrorDialog(commandFilename, error);
  }
};

// src/utils/showCalculationResultDialog.mjs
import { execa as execa3 } from "execa";
import os2 from "node:os";
import path3 from "node:path";
var showCalculationResultDialog = async (query, result) => {
  const cwd = path3.join(os2.homedir(), "Tools", "quickulator", "app");
  const target = path3.join(cwd, "dist", "quickulator");
  try {
    await execa3(target, [...query], { cwd, preferLocal: true });
  } catch (error) {
    console.error(`Failed to show calculation result`, error);
  }
};

// src/state/commands.mjs
var commandsState = [];
var getCommandsCatalog = () => commandsState;
var setCommandsCatalog = (newCommandsState) => {
  commandsState = newCommandsState;
};

// src/utils/getAllCommands.mjs
import path8 from "path";
import _10 from "lodash";
import { createRequire as createRequire3 } from "module";

// src/catalog/built-ins.mjs
import _7 from "lodash";

// src/catalog/_constants.mjs
var SCRIPT_PREFIX = "\u0192\u0578";
var MANAGE_SCRIPTS_PREFIX = "\u2425";
var FOLDER_PREFIX = "\u2302";
var APPLICATION_PREFIX = "\u232C";
var SYSTEM_PREFIX = "\u2699\uFE0E";
var SHORTCUT_PREFIX = "\u2318";

// src/catalog/built-ins.mjs
var BUILT_IN_COMMANDS = {
  "to-upper": _7.toUpper,
  "to-lower": _7.toLower,
  "camel-case": _7.camelCase,
  capitalize: _7.capitalize,
  "kebab-case": _7.kebabCase,
  "snake-case": _7.snakeCase,
  "start-case": _7.startCase,
  deburr: _7.deburr
};
var getBuiltInCommands = () => _7.map(BUILT_IN_COMMANDS, (command, name) => ({
  label: name,
  title: `${SCRIPT_PREFIX} ${name}`,
  value: command
}));

// src/catalog/folders.mjs
import os3 from "os";
import path4 from "path";
import open2 from "open";
var getFolders = () => ["Applications", "Documents", "Downloads", "Home", "Pictures"].map(
  (folder) => ({
    title: `${FOLDER_PREFIX} ${folder}`,
    value: folder,
    invoke: async () => {
      if (folder === "Applications") {
        await open2("/Applications");
      } else if (folder === "Home") {
        await open2(os3.homedir());
      } else {
        const dirname = path4.join(os3.homedir(), folder);
        await open2(dirname);
      }
    }
  })
);

// src/catalog/applications.mjs
import fs2 from "fs";
import path5 from "path";
import _8 from "lodash";
import { openApp } from "open";
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
        await openApp(value);
      }
    };
  });
  return items;
};

// src/catalog/system-preferences.mjs
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

// src/catalog/system.mjs
import { execa as execa4 } from "execa";
var getSystemCommands = () => [
  {
    title: `${SYSTEM_PREFIX} Shutdown`,
    invoke: async () => {
      await execa4("pmset", ["halt"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Restart`,
    invoke: async () => {
      await execa4("pmset", ["restart"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Sleep`,
    invoke: async () => {
      await execa4("pmset", ["sleepnow"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} Sleep Displays`,
    invoke: async () => {
      await execa4("pmset", ["displaysleepnow"]);
    }
  },
  {
    title: `${SYSTEM_PREFIX} About This Mac`,
    invoke: async () => {
      await execa4("open", ["-a", "About This Mac"]);
    }
  }
];

// src/catalog/manage-scripts.mjs
import cocoaDialog2 from "cocoa-dialog";
import _9 from "lodash";

// src/utils/createEmptyScript.mjs
import fs4 from "node:fs";
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

// src/utils/ensureEmptyFallbackHandler.mjs
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

// src/catalog/manage-scripts.mjs
var getManageScriptCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Create Script`,
    invoke: async () => {
      const result = await cocoaDialog2("filesave", {
        title: "Save Script As...",
        withDirectory: getConfigDir()
      });
      if (!_9.isEmpty(result)) {
        createEmptyScript(result);
        await editScript(result);
      }
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Script`,
    invoke: async () => {
      const result = await cocoaDialog2("fileselect", {
        title: "Choose Script To Edit...",
        withDirectory: getConfigDir()
      });
      if (!_9.isEmpty(result)) {
        await editScript(result);
      }
    }
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");
      ensureEmptyFallbackHandler();
      await editScript(fallbackHandlerFilename);
    }
  }
];

// src/catalog/scripts.mjs
import fs6 from "fs";
import path7 from "path";
var getScriptCommands = () => fs6.readdirSync(getConfigDir()).filter(
  (file) => file.endsWith(".js") && !file.includes("fallback-handler")
).map((command) => ({
  title: `${SCRIPT_PREFIX} ${path7.basename(command, ".js")}`,
  value: command
}));

// src/catalog/shortcuts.mjs
import { execaSync } from "execa";
var getShortcuts = () => {
  try {
    const shortcuts = execaSync("shortcuts", ["list"]).stdout.split("\n").filter(Boolean).map((shortcut) => {
      return {
        title: `${SHORTCUT_PREFIX} ${shortcut}`,
        invoke: async () => {
          try {
            await execaSync("shortcuts", ["run", shortcut]);
          } catch (error) {
            console.error(`Failed to run shortcut: ${error.message}`);
          }
        }
      };
    });
    return shortcuts;
  } catch (error) {
    console.error(`Failed to get shortcuts: ${error.message}`);
    return [];
  }
};

// src/utils/getAllCommands.mjs
var getCommandFilename2 = (commandFilename) => path8.join(getConfigDir(), commandFilename);
var getCommandsFromFallbackHandler = () => {
  const commandFilename = getCommandFilename2("fallback-handler.js");
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
    console.error(`Failed to run fallback handler: ${e.message}`);
    return [];
  }
};
var commandComparator = ({ title }) => title;
var applicationComparator = ({ score }) => -score;
var getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._10.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getFolders(),
    ...getShortcuts(),
    ..._10.chain([
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

// src/ui/main.mjs
var main_default = async () => {
  const selection = await getCurrentSelection();
  const commands = getCommandsCatalog();
  const item = await prompt_default(commands);
  let result;
  const require2 = createRequire4(import.meta.url);
  Object.assign(global, { open: open4, require: require2 });
  const commandContext = {
    open: open4,
    ENTER
  };
  if (item.isUnknown) {
    console.warn(`Unknown command`);
  } else if (_11.isFunction(item.value)) {
    result = item.value(selection);
  } else if (_11.isFunction(item.invoke)) {
    await item.invoke();
  } else if (item.isUnhandled) {
    console.warn(`Unhandled command: ${item.query}`);
    const calculated = calculate(item.query);
    if (didCalculate(calculated)) {
      result = String(calculated);
      await showCalculationResultDialog(item.query, result);
    } else {
      const commandFilename = getCommandFilename2("fallback-handler.js");
      try {
        const fallbackHandler = require2(commandFilename);
        const resultFromFallback = fallbackHandler.call(
          commandContext,
          selection,
          item.query
        );
        if (!_11.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        console.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  } else {
    const commandFilename = getCommandFilename2(item.value);
    result = await invokeScript(commandFilename, selection);
  }
  if (result && _11.isString(result)) {
    console.log(`Result: ${result}`);
    await setClipboardContent(stripKeystrokes(result));
    if (result.endsWith(ENTER)) {
      await pressEnter_default();
    }
    return true;
  } else if (result && _11.isObject(result) && "shortcut" in result) {
    const { shortcut, input } = result;
    try {
      await execaSync2("shortcuts", ["run", shortcut, "-i", input]);
    } catch (error) {
      console.error(`Failed to run shortcut: ${error.message}`);
    }
  }
  return false;
};

// src/bridge.mjs
import net from "node:net";
import fs7 from "node:fs";
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
  const lockExists = fs7.existsSync(SOCKET_FILE);
  if (lockExists) {
    fs7.unlinkSync(SOCKET_FILE);
  }
  const server = createServer(SOCKET_FILE, onMessage);
  const cleanup = () => {
    server.close();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
};

// src/state/rebuildCatalog.mjs
var rebuildCatalog = () => {
  console.log("Rebuilding commands catalog...");
  setCommandsCatalog(getAllCommands());
};

// src/runner.mjs
var spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots"
});
var run = async () => {
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
    notifier.notify({
      title: "META-x",
      message: "META-x encountered an error: " + error.message
    });
  }
  spinner.start();
};
rebuildCatalog();
setInterval(() => {
  spinner.stop();
  rebuildCatalog();
  spinner.start();
}, 1e3 * 60);
listen((message) => {
  if (message.trim() === "run") {
    run();
  } else {
    console.log(`Unknown message: "${message}"`);
  }
});
notifier.notify({
  title: "META-x",
  message: "META-x is ready"
});
spinner.start();
