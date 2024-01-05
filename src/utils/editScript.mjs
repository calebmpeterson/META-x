import { execa } from "execa";
import { getPathnameWithExtension } from "./getPathnameWithExtension.mjs";

export const editScript = async (pathname) => {
  await execa(process.env.EDITOR, [getPathnameWithExtension(pathname)]);
};
