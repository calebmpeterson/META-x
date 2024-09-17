import fs from "fs";
import path from "path";
import { getConfigDir } from "../utils/getConfigDir";
import { SNIPPET_PREFIX } from "./_constants";
import { ScriptCommand } from "./types";
import { SNIPPET_EXTENSION } from "../utils/createEmptySnippet";
import { getSnippetFilename } from "../utils/getSnippetFilename";

export const getSnippetCommands = (): ScriptCommand[] =>
  fs
    .readdirSync(getConfigDir("snippets"))
    .filter((file) => file.endsWith(SNIPPET_EXTENSION))
    .map((command) => ({
      title: `${SNIPPET_PREFIX} ${path.basename(command, SNIPPET_EXTENSION)}`,
      invoke: async (_selection: string) => {
        const snippetFilename = getSnippetFilename(command);
        const snippet = fs.readFileSync(snippetFilename, "utf-8");

        return snippet;
      },
    }));
