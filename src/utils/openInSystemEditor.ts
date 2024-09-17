import { execa } from "execa";
import { getPathnameWithExtension } from "./getPathnameWithExtension";

export const openInSystemEditor = async (
  pathname: string,
  extension = ".js"
) => {
  if (process.env.EDITOR) {
    await execa(process.env.EDITOR, [
      getPathnameWithExtension(pathname, extension),
    ]);
  }
};
