import cocoaDialog from "cocoa-dialog";
import { openInSystemEditor } from "./openInSystemEditor.js";
import _ from "lodash";

export const showCommandErrorDialog = async (
  commandFilename: string,
  error: unknown
) => {
  if (_.isError(error)) {
    const result = await cocoaDialog("textbox", {
      title: `Error in ${commandFilename}`,
      text: error.stack,
      height: 200,
      width: 600,
      button1: "Edit",
      button2: "Dismiss",
    });

    if (result === "1") {
      await openInSystemEditor(commandFilename);
    }
  }
};
