// https://github.com/cocoadialog/cocoadialog.com/tree/master/docroot/v2/examples
import cocoaDialog from "cocoa-dialog";

import { isMainThread, Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";

const runCocoaDialogInWorker = () => {
  const worker = new Worker(fileURLToPath(import.meta.url));

  worker.on("message", (result) => {
    clearTimeout(timeout);
    worker.terminate();
  });

  worker.on("error", (err) => {
    clearTimeout(timeout);
    worker.terminate();
  });

  return worker;
};

if (isMainThread) {
  const worker = runCocoaDialogInWorker();

  const timeout = setTimeout(() => {
    worker.terminate();
  }, 15000);
} else {
  await cocoaDialog("progressbar", {
    title: "Meta X",
    text: "Invoking command",
    width: 400,
    indeterminate: true,
  });
}
