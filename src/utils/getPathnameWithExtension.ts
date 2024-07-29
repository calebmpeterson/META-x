export const getPathnameWithExtension = (pathname: string) =>
  pathname.endsWith(".js") ? pathname : `${pathname}.js`;
