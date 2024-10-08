import ora from "ora";
import notifier from "node-notifier";
import prepareClipboard from "./clipboard/prepare";
import finishClipboard from "./clipboard/finish";
import showPrompt from "./ui/main";
import { listen } from "./ipc";
import { rebuildCatalog } from "./state/rebuildCatalog";
import _ from "lodash";
import { runClipboardHistory } from "./ui/clipboard-history";
import { updateClipboardHistory } from "./state/clipboardHistory";
import { getClipboardContent } from "./clipboard/utils";

const spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots",
});

const runCommand = async () => {
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
      notifier.notify({
        title: "META-x",
        message: "META-x encountered an error: " + error.message,
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
}, 1000 * 60);

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
  message: "META-x is ready",
});

spinner.start();
