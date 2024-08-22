export const clock =
  <Args extends unknown[], ReturnValue>(
    label: string,
    work: (...args: Args) => ReturnValue,
  ) =>
  (...args: Args): ReturnValue => {
    try {
      console.time(label);

      const result = work(...args);

      return result;
    } finally {
      console.timeEnd(label);
    }
  };
