import cocoaDialog from "cocoa-dialog";
import _ from "lodash";
import fs from "node:fs";
import open from "open";
import {
  createEmptySnippet,
  SNIPPET_EXTENSION,
} from "../utils/createEmptySnippet";
import { getConfigDir } from "../utils/getConfigDir";
import { openInSystemEditor } from "../utils/openInSystemEditor";
import { MANAGE_SNIPPETS_PREFIX } from "./_constants";

const SNIPPETS_DIR = getConfigDir("snippets");

// Ensure the snippets directory exists
if (!fs.existsSync(SNIPPETS_DIR)) {
  fs.mkdirSync(SNIPPETS_DIR, { recursive: true });
}

export const getManageSnippetCommands = () => [
  {
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Create Snippet`,
    invoke: async () => {
      const result = await cocoaDialog("filesave", {
        title: "Save Snippet As...",
        withDirectory: SNIPPETS_DIR,
      });

      if (!_.isEmpty(result)) {
        createEmptySnippet(result);
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    },
  },
  {
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Edit Snippet`,
    invoke: async () => {
      const result = await cocoaDialog("fileselect", {
        title: "Choose Snippet To Edit...",
        withDirectory: SNIPPETS_DIR,
      });

      if (!_.isEmpty(result)) {
        await openInSystemEditor(result, SNIPPET_EXTENSION);
      }
    },
  },
  {
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Manage Snippets`,
    invoke: async () => {
      await open(SNIPPETS_DIR);
    },
  },
];
