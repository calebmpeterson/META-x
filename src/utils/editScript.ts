import { execa } from "execa";
import { getPathnameWithExtension } from "./getPathnameWithExtension";

export const editScript = async (pathname: string) => {
  if (process.env.EDITOR) {
    await execa(process.env.EDITOR, [getPathnameWithExtension(pathname)]);
  }
};
