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
import promptAndRun from "./ui/main";
import { logger } from "./utils/logger";
import { setTerminalTitle } from "./utils/setTerminalTitle";
import { showNotification } from "./utils/showNotification";

logger.clear();

setTerminalTitle(TITLE);

const spinner = ora({
  text: "Ready",
  spinner: "dots",
});

const promptForAndRunCommand = async () => {
  try {
    logger.clear();
    logger.log("Meta-x triggered");

    await prepareClipboard();

    const result = await promptAndRun();

    if (result) {
      await finishClipboard();
    }
  } catch (error: unknown) {
    logger.error(error);

    if (_.isError(error)) {
      showNotification({
        message: "META-x encountered an error: " + error.message,
      });
    }
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
listen(async (message) => {
  try {
    spinner.stop();

    if (message.trim() === "run") {
      await promptForAndRunCommand();
    } else if (message.trim() === "clipboard-history") {
      await runClipboardHistory();
    } else {
      logger.log(`Unknown message: "${message}"`);
    }
  } catch (error: unknown) {
    logger.error(error);
  } finally {
    spinner.start();
  }
});

showNotification({
  message: `${TITLE} is ready`,
});

spinner.start();
