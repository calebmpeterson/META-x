import cocoaDialog from "cocoa-dialog";
import _ from "lodash";
import fs from "node:fs";
import open from "open";
import { TITLE } from "../constants";
import { createEmptyScript } from "../utils/createEmptyScript";
import { ensureEmptyFallbackHandler } from "../utils/ensureEmptyFallbackHandler";
import { getCommandFilename } from "../utils/getCommandFilename";
import { SCRIPTS_DIR } from "../utils/getConfigDir";
import { openInSystemEditor } from "../utils/openInSystemEditor";
import { MANAGE_SCRIPTS_PREFIX } from "./_constants";

// Ensure the scripts directory exists
if (!fs.existsSync(SCRIPTS_DIR)) {
  fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
}

export const getManageScriptCommands = () => [
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Manage Scripts`,
    invoke: async () => {
      await open(SCRIPTS_DIR);
    },
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Create Script`,
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Script As...",
        withDirectory: SCRIPTS_DIR,
      });

      if (!_.isEmpty(result)) {
        createEmptyScript(result);
        await openInSystemEditor(result);
      }
    },
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Edit Script`,
    invoke: async () => {
      const result = await cocoaDialog("fileselect", {
        title: "Choose Script To Edit...",
        withDirectory: SCRIPTS_DIR,
      });

      if (!_.isEmpty(result)) {
        await openInSystemEditor(result);
      }
    },
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Edit Fallback Handler`,
    invoke: async () => {
      const fallbackHandlerFilename = getCommandFilename("fallback-handler.js");

      ensureEmptyFallbackHandler();

      await openInSystemEditor(fallbackHandlerFilename);
    },
  },
  {
    prefix: MANAGE_SCRIPTS_PREFIX,
    title: `Open ${TITLE} Documentation`,
    invoke: async () => {
      await open(`https://github.com/calebmpeterson/META-x#command-context`);
    },
  },
];
