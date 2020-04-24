const { app, globalShortcut, BrowserWindow } = require("electron");

const path = require("path");

require("electron-reload")(path.join(__dirname, "src"), {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = !isDevelopment;

const SHORTCUT = "Alt+X";

function initialize() {
  globalShortcut.register(SHORTCUT, () => {
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
