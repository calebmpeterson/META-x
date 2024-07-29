import ora from "ora";
import notifier from "node-notifier";
import prepareClipboard from "./clipboard/prepare";
import finishClipboard from "./clipboard/finish";
import showPrompt from "./ui/main";
import { listen } from "./ipc";
import { rebuildCatalog } from "./state/rebuildCatalog";
import _ from "lodash";

const spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots",
});

const run = async () => {
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
  }

  spinner.start();
};

rebuildCatalog();

setInterval(() => {
  spinner.stop();
  rebuildCatalog();
  spinner.start();
}, 1000 * 60);

listen((message) => {
  if (message.trim() === "run") {
    run();
  } else {
    console.log(`Unknown message: "${message}"`);
  }
});

notifier.notify({
  title: "META-x",
  message: "META-x is ready",
});

spinner.start();
