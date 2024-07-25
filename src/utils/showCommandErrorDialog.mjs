import cocoaDialog from "cocoa-dialog";
import { editScript } from "./editScript.js";

export const showCommandErrorDialog = async (commandFilename, error) => {
  const result = await cocoaDialog("msgbox", {
    title: `Error in ${commandFilename}`,
    text: error.stack,
    button1: "Edit",
    button2: "Dismiss",
  });

  if (result === "1") {
    await editScript(commandFilename);
  }
};
