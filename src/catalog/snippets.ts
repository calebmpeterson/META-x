import fs from "fs";
import path from "path";
import { SNIPPET_EXTENSION } from "../utils/createEmptySnippet";
import { getConfigDir } from "../utils/getConfigDir";
import { getSnippetFilename } from "../utils/getSnippetFilename";
import { SNIPPET_PREFIX } from "./_constants";
import { ScriptCommand } from "./types";

export const getSnippetCommands = (): ScriptCommand[] =>
  fs
    .readdirSync(getConfigDir("snippets"))
    .filter((file) => file.endsWith(SNIPPET_EXTENSION))
    .map((command) => ({
      prefix: SNIPPET_PREFIX,
      title: `${path.basename(command, SNIPPET_EXTENSION)}`,
      invoke: async (_selection: string) => {
        const snippetFilename = getSnippetFilename(command);
        const snippet = fs.readFileSync(snippetFilename, "utf-8");

        return snippet;
      },
    }));
