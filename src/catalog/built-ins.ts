import _ from "lodash";
import { SCRIPT_PREFIX } from "./_constants";
import { BuiltInCommand } from "./types";

const BUILT_IN_COMMANDS = {
  "Camel Case": _.camelCase,
  "Kebab Case": _.kebabCase,
  "Snake Case": _.snakeCase,
  "Start Case": _.startCase,
  "Title Case": _.startCase,
  "To Lower": _.toLower,
  "To Upper": _.toUpper,
  Capitalize: _.capitalize,
  Deburr: _.deburr,
  "Sort Lines": (selection: string) =>
    _.chain(selection).split("\n").sort().join("\n").value(),
};

export const getBuiltInCommands = (): BuiltInCommand[] =>
  _.map(BUILT_IN_COMMANDS, (command, name) => ({
    label: name,
    title: `${SCRIPT_PREFIX} ${name}`,
    value: command,
  }));
