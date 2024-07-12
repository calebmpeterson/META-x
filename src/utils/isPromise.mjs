export const isPromise = (value): value =>
  typeof value === "object" &&
  "then" in value &&
  typeof value.then === "function";
