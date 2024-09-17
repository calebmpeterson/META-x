import fs from "node:fs";
import { getPathnameWithExtension } from "./getPathnameWithExtension";

export const SNIPPET_EXTENSION = ".txt";

const TEMPLATE = ``;

export const createEmptySnippet = (pathname: string) => {
  const nameWithExtension = getPathnameWithExtension(
    pathname,
    SNIPPET_EXTENSION
  );

  if (!fs.existsSync(nameWithExtension)) {
    fs.writeFileSync(nameWithExtension, TEMPLATE, "utf8");
  }
};
