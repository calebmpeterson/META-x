export const getPathnameWithExtension = (
  pathname: string,
  extension = ".js"
) => (pathname.endsWith(extension) ? pathname : `${pathname}${extension}`);
