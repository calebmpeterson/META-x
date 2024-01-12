import cocoaDialog from "cocoa-dialog";
import _ from "lodash";
import { createEmptyScript } from "../utils/createEmptyScript.mjs";
import { getConfigDir } from "../utils/getConfigDir.mjs";
import { editScript } from "../utils/editScript.mjs";

export const getManageScriptCommands = () => [
  {
    title: "⌁ Create Script",
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Script As...",
        withDirectory: getConfigDir(),
      });

      if (!_.isEmpty(result)) {
        createEmptyScript(result);
        await editScript(result);
      }
    },
  },
  {
    title: "⌁ Edit Script",
    invoke: async () => {
      const result = await cocoaDialog("fileselect", {
        title: "Choose Script To Edit...",
        withDirectory: getConfigDir(),
      });

      if (!_.isEmpty(result)) {
        await editScript(result);
      }
    },
  },
];
