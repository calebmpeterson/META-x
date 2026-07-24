import fs from "node:fs";
import open from "open";
import {
  createEmptySnippet,
  SNIPPET_EXTENSION,
} from "../utils/createEmptySnippet";
import { getConfigDir } from "../utils/getConfigDir";
import { invokeNativeTool } from "../utils/invokeNativeTool";
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
      const result = await invokeNativeTool({
        tool: "file.tool",
        mode: "save",
        title: "Save Snippet As...",
        directory: SNIPPETS_DIR,
      });

      const snippetFilename = result?.path;

      if (snippetFilename) {
        createEmptySnippet(snippetFilename);
        await openInSystemEditor(snippetFilename, SNIPPET_EXTENSION);
      }
    },
  },
  {
    prefix: MANAGE_SNIPPETS_PREFIX,
    title: `Edit Snippet`,
    invoke: async () => {
      const result = await invokeNativeTool({
        tool: "file.tool",
        mode: "open",
        title: "Choose Snippet To Edit...",
        directory: SNIPPETS_DIR,
      });

      const snippetFilename = result?.path;

      if (snippetFilename) {
        await openInSystemEditor(snippetFilename, SNIPPET_EXTENSION);
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
