import _ from "lodash";
import { SCRIPT_PREFIX } from "./_constants";
import { BuiltInCommand } from "./types";

const BUILT_IN_COMMANDS = {
  "camel-case": _.camelCase,
  "kebab-case": _.kebabCase,
  "snake-case": _.snakeCase,
  "start-case": _.startCase,
  "to-lower": _.toLower,
  "to-upper": _.toUpper,
  capitalize: _.capitalize,
  deburr: _.deburr,
  sort: (selection: string) =>
    _.chain(selection).split("\n").sort().join("\n").value(),
};

export const getBuiltInCommands = (): BuiltInCommand[] =>
  _.map(BUILT_IN_COMMANDS, (command, name) => ({
    label: name,
    title: `${SCRIPT_PREFIX} ${name}`,
    value: command,
  }));
