import _ from "lodash";
import { SCRIPT_PREFIX } from "./_constants";

const BUILT_IN_COMMANDS = {
  "to-upper": _.toUpper,
  "to-lower": _.toLower,
  "camel-case": _.camelCase,
  capitalize: _.capitalize,
  "kebab-case": _.kebabCase,
  "snake-case": _.snakeCase,
  "start-case": _.startCase,
  deburr: _.deburr,
};

export const getBuiltInCommands = () =>
  _.map(BUILT_IN_COMMANDS, (command, name) => ({
    label: name,
    title: `${SCRIPT_PREFIX} ${name}`,
    value: command,
  }));
