// https://github.com/cocoadialog/cocoadialog.com/tree/master/docroot/v2/examples
import cocoaDialog from "cocoa-dialog";

const result = await cocoaDialog("msgbox", {
  title: "Bubble",
  text: "Hello",
  button1: "Dismiss",
  button2: "Edit",
});

console.log({ result });
