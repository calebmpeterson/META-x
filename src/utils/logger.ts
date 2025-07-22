import chalk from "chalk";

const logger = {
  ...console,

  log: (...args: Parameters<typeof console.log>) => {
    const [first, ...rest] = args;
    console.log(
      chalk.grey(`⚙︎`),
      chalk.grey(first),
      ...rest.map((arg) => arg.toString())
    );
  },

  warn: (...args: Parameters<typeof console.warn>) => {
    const [first, ...rest] = args;
    console.warn(
      chalk.yellow(`⚠︎`),
      chalk.yellow(first),
      ...rest.map((arg) => arg.toString())
    );
  },

  error: (...args: Parameters<typeof console.error>) => {
    const [first, ...rest] = args;
    console.error(`⊗`, chalk.red(first), ...rest.map((arg) => arg.toString()));
  },
};

export { logger };
