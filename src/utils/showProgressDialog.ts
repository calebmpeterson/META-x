// https://github.com/cocoadialog/cocoadialog.com/tree/master/docroot/v2/examples
import cocoaDialog from "cocoa-dialog";

import { isMainThread, Worker, workerData } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { TITLE } from "../constants";

const runInWorker = (title: string) => {
  const worker = new Worker(fileURLToPath(import.meta.url), {
    workerData: { title },
  });

  worker.on("message", () => {
    worker.terminate();
  });

  worker.on("error", () => {
    worker.terminate();
  });

  return worker;
};

export const showProgressDialog = (title: string) => {
  if (isMainThread) {
    return runInWorker(title);
  }
};

if (!isMainThread) {
  const { title } = workerData;

  // Do not show the progress dialog until the command has been running for a bit
  setTimeout(async () => {
    await cocoaDialog("progressbar", {
      title: TITLE,
      text: `Invoking ${title}`,
      width: 400,
      indeterminate: true,
    });
  }, 5000);
}
