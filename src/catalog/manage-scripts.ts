import cocoaDialog from "cocoa-dialog";
import _ from "lodash";
import { createEmptyScript } from "../utils/createEmptyScript";
import { getConfigDir } from "../utils/getConfigDir";
import { openInSystemEditor } from "../utils/openInSystemEditor";
import { ensureEmptyFallbackHandler } from "../utils/ensureEmptyFallbackHandler";
import { MANAGE_SCRIPTS_PREFIX } from "./_constants";
import { getCommandFilename } from "../utils/getCommandFilename";

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
        await openInSystemEditor(result);
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
        await openInSystemEditor(result);
      }
    },
  },
  {
    title: `${MANAGE_SCRIPTS_PREFIX} Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

      ensureEmptyFallbackHandler();

      await openInSystemEditor(fallbackHandlerFilename);
    },
  },
];
