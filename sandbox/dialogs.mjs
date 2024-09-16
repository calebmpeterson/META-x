// https://github.com/cocoadialog/cocoadialog.com/tree/master/docroot/v2/examples
import cocoaDialog from "cocoa-dialog";

const result = await cocoaDialog("textbox", {
  title: "Bubble",
  text: "Hello",
  height: 200,
  width: 600,
  button1: "Dismiss",
  button2: "Edit",
});

console.log({ result });
