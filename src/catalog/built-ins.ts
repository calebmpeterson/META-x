import _ from "lodash";
import { SCRIPT_PREFIX } from "./_constants";
import { BuiltInCommand } from "./types";

const BUILT_IN_COMMANDS = {
  // Basic string case transformations
  "Camel Case": _.camelCase,
  "Kebab Case": _.kebabCase,
  "Snake Case": _.snakeCase,
  "Start Case": _.startCase,
  "Title Case": _.startCase,
  "Lower Case": _.toLower,
  "Upper Case": _.toUpper,
  "Sentence Case": _.capitalize,
  Capitalize: _.capitalize,
  Deburr: _.deburr,

  // Multi-line transformations
  "Sort Lines": (selection: string) =>
    _.chain(selection).split("\n").sort().join("\n").value(),
  "Reverse Lines": (selection: string) =>
    _.chain(selection).split("\n").reverse().join("\n").value(),

  // Markdown transformations
  "To Markdown List": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `- ${line}`)
      .join("\n")
      .value(),
  "To Markdown Blockquote": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")
      .value(),
  "To Markdown Checklist": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `- [ ] ${line}`)
      .join("\n")
      .value(),
  "To Markdown Strikethrough": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `~${line}~`)
      .join("\n")
      .value(),
  "To Markdown Italic": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `_${line}_`)
      .join("\n")
      .value(),
  "To Markdown Bold": (selection: string) =>
    _.chain(selection)
      .split("\n")
      .map((line) => `**${line}**`)
      .join("\n")
      .value(),
};

export const getBuiltInCommands = (): BuiltInCommand[] =>
  _.map(BUILT_IN_COMMANDS, (command, name) => ({
    prefix: SCRIPT_PREFIX,
    label: name,
    title: name,
    value: command,
  }));
