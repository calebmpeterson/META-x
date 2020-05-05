const { app, globalShortcut, BrowserWindow } = require("electron");
const { getConfig } = require("./utils");
const prepareClipboard = require("./clipboard/prepare");

const isDevelopment = process.env.NODE_ENV === "development";

function initialize() {
  const { hotkey } = getConfig();

  console.log(`Using hotkey ${hotkey}`);

  globalShortcut.register(hotkey, async () => {
    await prepareClipboard();

    const win = new BrowserWindow({
      center: true,
      width: 600,
      height: 400,
      frame: false,
      transparent: true,
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
  });
}

app.whenReady().then(initialize);

app.on("window-all-closed", (e) => e.preventDefault());

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
