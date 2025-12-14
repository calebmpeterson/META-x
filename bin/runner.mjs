// src/runner.ts
import _21 from "lodash";
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
    console.error(
      chalk.red(`\u2738`),
      chalk.red(first),
      ...rest.map((arg) => arg.toString())
    );
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
import _15 from "lodash";
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
var CACHE = {};
var getConfigOption = (key, defaultValue) => {
  if (_3.has(CACHE, key)) {
    return CACHE[key];
  }
  try {
    const contents = fs2.readFileSync(CONFIG_FILENAME, "utf8");
    const json = JSON5.parse(contents);
    const value = _3.get(json, key, defaultValue);
    CACHE[key] = value;
    return value;
  } catch {
    return defaultValue;
  }
};
var clearConfigCache = () => {
  Object.keys(CACHE).forEach((key) => {
    delete CACHE[key];
  });
};

// src/catalog/_constants.ts
var SCRIPT_PREFIX = "\u{F0871}";
var SNIPPET_PREFIX = "\u{F0798}";
var MANAGE_SCRIPTS_PREFIX = "\u{F10D6}";
var MANAGE_SNIPPETS_PREFIX = "\u{F0173}";
var FOLDER_PREFIX = "\u{F0DCF}";
var APPLICATION_PREFIX = "\u{F1591}";
var SYSTEM_PREFIX = "\u{F0493}";
var SHORTCUT_PREFIX = "\u{F0633}";
var RELOAD_PREFIX = "\u{F0453}";
var CONFIGURE_PREFIX = "\u{F0494}";

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
      prefix: APPLICATION_PREFIX,
      title: name,
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
  // Basic string case transformations
  "Camel Case": _5.camelCase,
  "Kebab Case": _5.kebabCase,
  "Snake Case": _5.snakeCase,
  "Start Case": _5.startCase,
  "Title Case": _5.startCase,
  "Lower Case": _5.toLower,
  "Upper Case": _5.toUpper,
  "Sentence Case": _5.capitalize,
  Capitalize: _5.capitalize,
  Deburr: _5.deburr,
  "Pascal Case": (selection) => _5.upperFirst(_5.camelCase(selection)),
  // Multi-line transformations
  "Sort Lines": (selection) => _5.chain(selection).split("\n").sort().join("\n").value(),
  "Reverse Lines": (selection) => _5.chain(selection).split("\n").reverse().join("\n").value(),
  // Markdown transformations
  "To Markdown List": (selection) => _5.chain(selection).split("\n").map((line) => `- ${line}`).join("\n").value(),
  "To Markdown Blockquote": (selection) => _5.chain(selection).split("\n").map((line) => `> ${line}`).join("\n").value(),
  "To Markdown Checklist": (selection) => _5.chain(selection).split("\n").map((line) => `- [ ] ${line}`).join("\n").value(),
  "To Markdown Strikethrough": (selection) => _5.chain(selection).split("\n").map((line) => `~${line}~`).join("\n").value(),
  "To Markdown Italic": (selection) => _5.chain(selection).split("\n").map((line) => `_${line}_`).join("\n").value(),
  "To Markdown Bold": (selection) => _5.chain(selection).split("\n").map((line) => `**${line}**`).join("\n").value()
};
var getBuiltInCommands = () => _5.map(BUILT_IN_COMMANDS, (command, name) => ({
  prefix: SCRIPT_PREFIX,
  label: name,
  title: name,
  value: command
}));

// src/utils/getCommandFilename.ts
import path4 from "node:path";
var getCommandFilename = (commandFilename) => path4.join(SCRIPTS_DIR, commandFilename);

// src/catalog/folders.ts
import open, { openApp as openApp2 } from "open";
import os2 from "os";
import path5 from "path";
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
  prefix: FOLDER_PREFIX,
  title: folder,
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

// src/utils/openInSystemEditor.ts
import { execa } from "execa";

// src/utils/getPathnameWithExtension.ts
var getPathnameWithExtension = (pathname, extension = ".js") => pathname.endsWith(extension) ? pathname : `${pathname}${extension}`;

// src/utils/openInSystemEditor.ts
var openInSystemEditor = async (pathname, extension = ".js") => {
  if (process.env.EDITOR) {
    await execa(process.env.EDITOR, [
      '"' + getPathnameWithExtension(pathname, extension) + '"'
    ]);
  }
};

// src/catalog/manage.ts
if (!fs4.existsSync(SCRIPTS_DIR)) {
  fs4.mkdirSync(SCRIPTS_DIR, { recursive: true });
}
var getManageCommands = () => [
  {
    prefix: RELOAD_PREFIX,
    title: `Reload`,
    invoke: async () => {
      clearConfigCache();
      rebuildCatalog();
    }
  },
  {
    prefix: CONFIGURE_PREFIX,
    title: `Configure`,
    invoke: async () => {
      openInSystemEditor(CONFIG_FILENAME, "");
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

// src/catalog/manage-scripts.ts
if (!fs7.existsSync(SCRIPTS_DIR)) {
  fs7.mkdirSync(SCRIPTS_DIR, { recursive: true });
}
var getManageScriptCommands = () => [
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Manage Scripts`,
    invoke: async () => {
      await open2(SCRIPTS_DIR);
    }
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Create Script`,
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
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Edit Script`,
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
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");
      ensureEmptyFallbackHandler();
      await openInSystemEditor(fallbackHandlerFilename);
    }
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Open ${TITLE} Documentation`,
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
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Create Snippet`,
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
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Edit Snippet`,
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
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Manage Snippets`,
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
import _13 from "lodash";
import fs10 from "node:fs";
import vm from "node:vm";

// src/utils/createScriptContext.ts
import { Key as Key3, keyboard as keyboard3 } from "@nut-tree-fork/nut-js";
import axios from "axios";
import dotenv from "dotenv";
import { $, execa as execa3 } from "execa";
import _10 from "lodash";
import { createRequire } from "module";
import open4 from "open";
import { runAppleScript } from "run-applescript";

// src/keystrokes/constants.ts
var ENTER = "{ENTER}";

// src/utils/choose.ts
import { exec } from "child_process";
import _8 from "lodash";

// src/utils/getFontName.ts
var getFontName = () => "FiraCode Nerd Font";

// src/utils/getFontSize.ts
var CONFIG_FONT_SIZE_KEY = "font-size";
var DEFAULT_FONT_SIZE = "16";
var getFontSize = () => getConfigOption(CONFIG_FONT_SIZE_KEY, DEFAULT_FONT_SIZE);

// src/utils/choose.ts
var choose = (items, options = {}) => new Promise((resolve) => {
  const choices = items.join("\n");
  const toShow = Math.max(5, Math.min(40, _8.size(items)));
  const outputConfig = [
    options.returnIndex ? "-i" : "",
    options.placeholder ? `-p "${options.placeholder}"` : ""
  ].join(" ");
  const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s ${getFontSize()} -m -n ${toShow} ${outputConfig}`;
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

// src/utils/invokeNativeTool.ts
import { execa as execa2 } from "execa";
import _9 from "lodash";
import path6 from "path";
var isDisplayToolInvocation = (invocation) => {
  return invocation.tool === "display.tool";
};
var invokeNativeTool = async (invocation) => {
  const toolDirectory = path6.join(process.cwd(), "bin", "tools");
  const toolExecutable = path6.join(toolDirectory, invocation.tool);
  try {
    if (isDisplayToolInvocation(invocation)) {
      await execa2(toolExecutable, [
        ...invocation.timeout ? ["--timeout", String(invocation.timeout)] : [],
        invocation.message
      ]);
    } else {
      await execa2("shortcuts", ["run", invocation.tool]);
    }
  } catch (error) {
    if (_9.isError(error)) {
      logger.error(`Failed to run tool: ${error.message}`);
    } else {
      logger.error(`Failed to run tool: ${invocation.tool}`);
    }
  }
};

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
    _: _10,
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
    execa: execa3,
    $,
    osascript: runAppleScript,
    choose,
    notify: showNotification,
    setTimeout,
    delay,
    // Display a message to the user with an optional timeout
    display: async (message, timeout) => {
      await invokeNativeTool({ tool: "display.tool", message, timeout });
    },
    keyboard: keyboard3,
    Key: Key3
  };
  return commandContext;
};

// src/utils/processInvokeScriptResult.ts
import _11 from "lodash";
var processInvokeScriptResult = (result) => _11.isArray(result) || _11.isObject(result) ? result : _11.toString(result);

// src/utils/showCommandErrorDialog.ts
import cocoaDialog3 from "cocoa-dialog";
import _12 from "lodash";
var showCommandErrorDialog = async (commandFilename, error) => {
  if (_12.isError(error)) {
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
    if (!_13.isUndefined(result)) {
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
  prefix: SCRIPT_PREFIX,
  title: `${getCommandTitle(command)}`,
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
        prefix: SHORTCUT_PREFIX,
        title: shortcut,
        invoke: async () => {
          try {
            execaSync("shortcuts", ["run", shortcut]);
          } catch (error) {
            if (_14.isError(error)) {
              logger.error(`Failed to run shortcut: ${error.message}`);
            }
          }
        }
      };
    });
    return shortcuts;
  } catch (error) {
    if (_14.isError(error)) {
      logger.error(`Failed to get shortcuts: ${error.message}`);
    }
    return [];
  }
};

// src/catalog/snippets.ts
import fs12 from "fs";
import path8 from "path";

// src/utils/getSnippetFilename.ts
import path7 from "node:path";
var getSnippetFilename = (snippetFilename) => path7.join(getConfigDir("snippets"), snippetFilename);

// src/catalog/snippets.ts
var getSnippetCommands = () => fs12.readdirSync(getConfigDir("snippets")).filter((file) => file.endsWith(SNIPPET_EXTENSION)).map((command) => ({
  prefix: SNIPPET_PREFIX,
  title: `${path8.basename(command, SNIPPET_EXTENSION)}`,
  invoke: async (_selection) => {
    const snippetFilename = getSnippetFilename(command);
    const snippet = fs12.readFileSync(snippetFilename, "utf-8");
    return snippet;
  }
}));

// src/catalog/system.ts
import { execa as execa4 } from "execa";
var getSystemCommands = () => [
  {
    prefix: SYSTEM_PREFIX,
    title: `Sleep`,
    invoke: async () => {
      await execa4("pmset", ["sleepnow"]);
    }
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `Sleep Displays`,
    invoke: async () => {
      await execa4("pmset", ["displaysleepnow"]);
    }
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `About This Mac`,
    invoke: async () => {
      await execa4("open", ["-a", "About This Mac"]);
    }
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `Lock Displays`,
    invoke: async () => {
      await execa4("open", [
        "-a",
        "/System/Library/CoreServices/ScreenSaverEngine.app"
      ]);
    }
  }
];

// src/catalog/system-preferences.ts
import fs13 from "node:fs";
import path9 from "node:path";
import open5 from "open";
var PREFERENCE_PANE_ROOT_DIR = "/System/Library/PreferencePanes";
var DEFAULT_IGNORED2 = [];
var getPreferencePanes = () => {
  const ignored = getConfigOption("ignored", DEFAULT_IGNORED2);
  return fs13.readdirSync(PREFERENCE_PANE_ROOT_DIR).map((filename) => path9.parse(filename).name).filter((filename) => !ignored.some((ignore) => filename.includes(ignore)));
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
    if (_15.isError(e)) {
      logger.error(`Failed to run fallback handler: ${e.message}`);
    }
    return [];
  }
};
var commandComparator = ({ title }) => title;
var applicationComparator = ({ score }) => -score;
var getAllCommands = clock("getAllCommands", () => {
  const allCommands = [
    ..._15.sortBy(
      [...getScriptCommands(), ...getBuiltInCommands()],
      commandComparator
    ),
    ...getManageScriptCommands(),
    ...getSnippetCommands(),
    ...getManageSnippetCommands(),
    ...getManageCommands(),
    ...getFolders(),
    ...getShortcuts(),
    ..._15.chain([
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
import _16 from "lodash";
var formatHistoryEntry = (entry) => {
  const firstLine = entry.includes("\n") ? _16.truncate(
    entry.split("\n").find((line) => !_16.isEmpty(line)),
    { length: 50 }
  ) : _16.truncate(entry, { length: 50 });
  return _16.trim(firstLine);
};
var runClipboardHistory = async () => {
  const history = getClipboardHistory();
  const historyItems = _16.map(history, (entry) => formatHistoryEntry(entry));
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
import _20 from "lodash";
import { createRequire as createRequire3 } from "module";
import open6 from "open";

// src/catalog/unknown.ts
var UNKNOWN_COMMAND = {
  isUnknown: true
};

// src/keystrokes/pressEnter.ts
import { keyboard as keyboard4, Key as Key4 } from "@nut-tree-fork/nut-js";
var pressEnter_default = async () => {
  await delay(1e3);
  await keyboard4.pressKey(Key4.Enter);
  await delay(10);
  await keyboard4.releaseKey(Key4.Enter);
};

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

// src/utils/invokeShortcut.ts
import { execa as execa5 } from "execa";
import _17 from "lodash";
var invokeShortcut = async ({ shortcut, input }) => {
  try {
    await execa5("shortcuts", ["run", shortcut, "-i", input ?? ""]);
  } catch (error) {
    if (_17.isError(error)) {
      logger.error(`Failed to run shortcut: ${error.message}`);
    } else {
      logger.error(`Failed to run shortcut: ${shortcut}`);
    }
  }
};

// src/utils/isShortcutResult.ts
import _18 from "lodash";
var isShortcutResult = (result) => Boolean(result) && _18.isObject(result) && "shortcut" in result && _18.isString(result.shortcut);

// src/utils/showCalculationResultDialog.ts
var showCalculationResultDialog = async (query, result) => {
  invokeNativeTool({
    tool: "display.tool",
    message: `${query} = ${result}`,
    timeout: 5
  });
};

// src/utils/stripKeystrokes.ts
var stripKeystrokes = (text) => text.endsWith(ENTER) ? text.slice(0, -ENTER.length) : text;

// src/ui/prompt/darwin.ts
import _19 from "lodash";

// src/utils/SpawnCache.ts
import { spawn } from "child_process";
var SpawnCache = class {
  constructor(command, args = []) {
    this.command = command;
    this.args = args;
    this.spawnTool();
  }
  child = null;
  ready = Promise.resolve();
  spawnTool = () => {
    this.child = spawn(this.command, this.args, {
      stdio: ["pipe", "pipe", "pipe"]
    });
    this.child.stdout.setEncoding("utf-8");
    this.child.stderr.setEncoding("utf-8");
    this.child.on("exit", (code, signal) => {
      console.warn(
        `[tool] exited (code=${code}, signal=${signal}), respawning...`
      );
      this.child = null;
      this.spawnTool();
    });
    this.ready = new Promise((resolve) => {
      process.nextTick(resolve);
    });
  };
  async run(input) {
    await this.ready;
    const child = this.child;
    if (!child) return { stderr: "Tool is not available" };
    return new Promise((resolve) => {
      let stdout = "";
      let stderr = "";
      const onStdout = (chunk) => {
        stdout += chunk.toString();
      };
      const onStderr = (chunk) => {
        stderr += chunk.toString();
      };
      const onClose = () => {
        child.stdout.off("data", onStdout);
        child.stderr.off("data", onStderr);
        resolve({
          stdout: stdout || void 0,
          stderr: stderr || void 0
        });
      };
      child.stdout.once("data", onStdout);
      child.stderr.once("data", onStderr);
      child.once("close", onClose);
      child.stdin.write(input);
      child.stdin.end();
    });
  }
};

// src/ui/prompt/darwin.ts
var PROMPT = "Run a command or open an application";
var choose2 = new SpawnCache("choose", [
  `-f`,
  getFontName(),
  "-b",
  "000000",
  "-c",
  "222222",
  "-w",
  "30",
  "-s",
  getFontSize(),
  "-m",
  "-n",
  "30",
  "-p",
  PROMPT
]);
var darwin_default3 = (commands) => new Promise(async (resolve, reject) => {
  const choices = commands.map(({ title, prefix }) => [prefix, title].filter(Boolean).join(" ")).join("\n");
  const chooseProcess = choose2.run(choices);
  const { stdout = "", stderr } = await chooseProcess;
  if (stdout.trim().length > 0) {
    const query = _19.trim(stdout);
    const rawQueryCommand = {
      isUnhandled: true,
      query
    };
    const command = commands.find(
      ({ prefix, title, isFallback }) => [prefix, title].filter(Boolean).join(" ") === query && !isFallback
    ) || rawQueryCommand;
    resolve(command);
  } else {
    if (stderr && process.env.NODE_ENV === "development") {
      logger.error(stderr);
    }
    resolve(UNKNOWN_COMMAND);
  }
});

// src/ui/prompt/index.ts
var prompt_default = (commands) => darwin_default3(commands);

// src/ui/main.ts
var main_default = async (injected) => {
  const selection = await getCurrentSelection();
  const commands = getCommandsCatalog();
  const item = injected ? commands.find((command) => command.title === injected) ?? UNKNOWN_COMMAND : await prompt_default(commands);
  let result;
  const require2 = createRequire3(import.meta.url);
  Object.assign(global, { open: open6, require: require2 });
  if ("isUnknown" in item) {
    logger.warn(`Unknown command`);
  } else if ("value" in item && _20.isFunction(item.value)) {
    result = item.value(selection);
  } else if ("invoke" in item && _20.isFunction(item.invoke)) {
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
        if (!_20.isUndefined(resultFromFallback)) {
          result = processInvokeScriptResult(resultFromFallback);
        }
      } catch (e) {
        logger.error(`Failed to execute ${commandFilename}`, e);
      }
    }
  }
  if (result && _20.isString(result)) {
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

// src/utils/setTerminalTitle.ts
var setTerminalTitle = (title, { bell = false } = {}) => {
  const ESC = "\x1B";
  process.stdout.write(`${ESC}]0;${title}${ESC}\\`);
  if (bell) {
    process.stdout.write("\x07");
  }
};

// src/runner.ts
logger.clear();
setTerminalTitle(TITLE);
var spinner = ora({
  text: "Ready",
  spinner: "dots"
});
var promptForAndRunCommand = async (injected) => {
  try {
    logger.clear();
    logger.log("Meta-x triggered");
    await prepare_default();
    const result = await main_default(injected);
    if (result) {
      await finish_default();
    }
  } catch (error) {
    logger.error(error);
    if (_21.isError(error)) {
      showNotification({
        message: "META-x encountered an error: " + error.message
      });
    }
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
listen(async (message) => {
  try {
    spinner.stop();
    if (message.trim() === "run") {
      await promptForAndRunCommand();
    } else if (message.trim().startsWith("run")) {
      const injection = message.slice(3).trim();
      logger.info(`Invoking "${injection}"`);
      await promptForAndRunCommand(injection);
    } else if (message.trim() === "clipboard-history") {
      await runClipboardHistory();
    } else {
      logger.log(`Unknown message: "${message}"`);
    }
  } catch (error) {
    logger.error(error);
  } finally {
    spinner.start();
  }
});
showNotification({
  message: `${TITLE} is ready`
});
spinner.start();
