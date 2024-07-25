import cocoaDialog from "cocoa-dialog";
import { editScript } from "./editScript.js";
import _ from "lodash";

export const showCommandErrorDialog = async (
  commandFilename: string,
  error: unknown
) => {
  if (_.isError(error)) {
    const result = await cocoaDialog("msgbox", {
      title: `Error in ${commandFilename}`,
      text: error.stack,
      button1: "Edit",
      button2: "Dismiss",
    });

    if (result === "1") {
      await editScript(commandFilename);
    }
  }
};
