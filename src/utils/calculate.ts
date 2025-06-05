import vm from "node:vm";
import { logger } from "./logger";

const INCALCULABLE = Symbol("incalculable");

export const calculate = (input: string) => {
  try {
    const script = new vm.Script(input);
    const result = script.runInNewContext();
    logger.log(`Calculated ${input} as ${result}`);
    return result;
  } catch {
    return INCALCULABLE;
  }
};

export const didCalculate = (result: unknown) => result !== INCALCULABLE;
