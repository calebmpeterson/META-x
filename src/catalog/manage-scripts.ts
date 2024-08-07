import cocoaDialog from "cocoa-dialog";
import _ from "lodash";
import { createEmptyScript } from "../utils/createEmptyScript.js";
import { getConfigDir } from "../utils/getConfigDir.js";
import { editScript } from "../utils/editScript.js";
import { ensureEmptyFallbackHandler } from "../utils/ensureEmptyFallbackHandler.js";
import { MANAGE_SCRIPTS_PREFIX } from "./_constants.js";
import { getCommandFilename } from "../utils/getCommandFilename.js";

export const getManageScriptCommands = () => [
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Create Script`,
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
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Script`,
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
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

      ensureEmptyFallbackHandler();

      await editScript(fallbackHandlerFilename);
    },
  },
];
