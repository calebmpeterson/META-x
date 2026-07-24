import { invokeNativeTool } from "./invokeNativeTool.js";
import { openInSystemEditor } from "./openInSystemEditor.js";
import _ from "lodash";

export const showCommandErrorDialog = async (
  commandFilename: string,
  error: unknown
) => {
  if (_.isError(error)) {
    const result = await invokeNativeTool({
      tool: "alert.tool",
      title: `Error in ${commandFilename}`,
      text: error.stack ?? error.message,
      button1: "Edit",
      button2: "Dismiss",
    });

    if (result?.button === "Edit") {
      await openInSystemEditor(commandFilename);
    }
  }
};
