import ora from "ora";
import notifier from "node-notifier";
import prepareClipboard from "./clipboard/prepare/index.mjs";
import finishClipboard from "./clipboard/finish/index.mjs";
import showPrompt from "./ui/main.mjs";
import { listen } from "./bridge.mjs";

const spinner = ora({
  text: "Ready",
  interval: 500,
  spinner: "dots",
});

const run = async () => {
  spinner.stop();

  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await showPrompt();
  if (result) {
    await finishClipboard();
  }

  spinner.start();
};

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
