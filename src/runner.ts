import _ from "lodash";
import ora from "ora";
import finishClipboard from "./clipboard/finish";
import prepareClipboard from "./clipboard/prepare";
import { getClipboardContent } from "./clipboard/utils";
import { TITLE } from "./constants";
import { listen } from "./ipc";
import { updateClipboardHistory } from "./state/clipboardHistory";
import { rebuildCatalog } from "./state/rebuildCatalog";
import { runClipboardHistory } from "./ui/clipboard-history";
import showPrompt from "./ui/main";
import { showNotification } from "./utils/showNotification";

console.clear();

const spinner = ora({
  text: "Ready",
  spinner: "dots",
});

const promptForAndRunCommand = async () => {
  spinner.stop();

  try {
    console.log("Meta-x triggered");

    await prepareClipboard();
    const result = await showPrompt();
    if (result) {
      await finishClipboard();
    }
  } catch (error: unknown) {
    console.error(error);

    if (_.isError(error)) {
      showNotification({
        message: "META-x encountered an error: " + error.message,
      });
    }
  } finally {
    spinner.start();
  }
};

rebuildCatalog();

// Rebuild the catalog every minute
setInterval(async () => {
  spinner.stop();
  rebuildCatalog();
  spinner.start();
}, 1000 * 60);

// Update the clipboard history every 250ms
setInterval(async () => {
  updateClipboardHistory(await getClipboardContent());
}, 250);

// Listen for IPC messages
listen((message) => {
  if (message.trim() === "run") {
    promptForAndRunCommand();
  } else if (message.trim() === "clipboard-history") {
    runClipboardHistory();
  } else {
    console.log(`Unknown message: "${message}"`);
  }
});

showNotification({
  message: `${TITLE} is ready`,
});

spinner.start();
