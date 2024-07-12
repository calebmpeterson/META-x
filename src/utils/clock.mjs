export const clock =
  (label, work) =>
  (...args) => {
    try {
      console.time(label);

      const result = work(...args);

      return result;
    } finally {
      console.timeEnd(label);
    }
  };
