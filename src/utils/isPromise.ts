export const isPromise = (value: unknown): value is Promise<unknown> =>
  Boolean(
    typeof value === "object" &&
      value &&
      "then" in value &&
      typeof value.then === "function",
  );
