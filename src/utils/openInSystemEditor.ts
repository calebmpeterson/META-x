import { execa } from "execa";
import { getPathnameWithExtension } from "./getPathnameWithExtension";
import { logger } from "./logger";

export const openInSystemEditor = async (
  pathname: string,
  extension = ".js",
) => {
  if (process.env.EDITOR) {
    const completedPathname = getPathnameWithExtension(pathname, extension);
    const safePathname = completedPathname.includes(" ")
      ? `"${completedPathname}"`
      : completedPathname;

    logger.info(`Opening ${pathname} in ${process.env.EDITOR}`);

    await execa(process.env.EDITOR, [safePathname]);
  } else {
    logger.error("EDITOR is not set");
  }
};
