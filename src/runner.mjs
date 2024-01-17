import prepareClipboard from "./clipboard/prepare/index.mjs";
import finishClipboard from "./clipboard/finish/index.mjs";
import showPrompt from "./ui/main.mjs";
import { listen } from "./bridge.mjs";

const run = async () => {
  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await showPrompt();
  if (result) {
    await finishClipboard();
  }
};

listen((message) => {
  if (message === "run") {
    run();
  }
});
