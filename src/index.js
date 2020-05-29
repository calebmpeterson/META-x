const { app, globalShortcut, BrowserWindow } = require("electron");
const { getConfig } = require("./utils");
const prepareClipboard = require("./clipboard/prepare");
const finishClipboard = require("./clipboard/finish");

const isDevelopment = process.env.NODE_ENV === "development";

const openTerminal = require("./terminal/main");

const openWindow = () => {
  const win = new BrowserWindow({
    center: true,
    width: 600,
    height: 400,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");

  if (isDevelopment) {
    win.webContents.openDevTools({ mode: "detach" });
  }
  win.focus();
  win.on("blur", () => {
    if (!win.webContents.isDevToolsFocused()) {
      win.close();
    }
  });
};

const open = openTerminal;

function initialize() {
  const { hotkey } = getConfig();

  console.log(`Using hotkey ${hotkey}`);

  globalShortcut.register(hotkey, async () => {
    console.log("Meta-x triggered");
    await prepareClipboard();
    await open();
    await finishClipboard();
  });
}

app.whenReady().then(initialize);

app.on("window-all-closed", (e) => e.preventDefault());

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
