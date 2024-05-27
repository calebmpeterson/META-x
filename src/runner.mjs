import ora from "ora";
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
  if (message === "run") {
    run();
  }
});

spinner.start();
