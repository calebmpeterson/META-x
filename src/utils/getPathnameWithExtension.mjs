export const getPathnameWithExtension = (pathname) =>
  pathname.endsWith(".js") ? pathname : `${pathname}.js`;
