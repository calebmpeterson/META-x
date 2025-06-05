import { logger } from "./logger";

export const clock =
  <Args extends unknown[], ReturnValue>(
    label: string,
    work: (...args: Args) => ReturnValue
  ) =>
  (...args: Args): ReturnValue => {
    try {
      logger.time(label);

      const result = work(...args);

      return result;
    } finally {
      logger.timeEnd(label);
    }
  };
