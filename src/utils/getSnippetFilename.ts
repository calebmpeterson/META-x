import path from "node:path";
import { getConfigDir } from "./getConfigDir";

export const getSnippetFilename = (snippetFilename: string) =>
  path.join(getConfigDir("snippets"), snippetFilename);
