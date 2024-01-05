// https://github.com/cocoadialog/cocoadialog.com/tree/master/docroot/v2/examples
import cocoaDialog from "cocoa-dialog";
import path from "node:path";
import os from "node:os";

const result = await cocoaDialog("filesave", {
  title: "Create empty script",
  withDirectory: path.join(os.homedir(), ".meta-x"),
});

console.log({ result });
