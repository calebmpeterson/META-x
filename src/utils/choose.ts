import { exec } from "child_process";
import _ from "lodash";
import { getFontName } from "./getFontName";

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui

type ChooseResult = string | undefined;

type Options = {
  returnIndex?: boolean;
  placeholder?: string;
};

export const choose = (items: string[], options: Options = {}) =>
  new Promise<ChooseResult>((resolve) => {
    const choices = items.join("\n");
    const toShow = Math.max(5, Math.min(40, _.size(items)));
    const outputConfig = [
      options.returnIndex ? "-i" : "",
      options.placeholder ? `-p "${options.placeholder}"` : "",
    ].join(" ");
    const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s 16 -m -n ${toShow} ${outputConfig}`;

    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const selection = _.trim(stdout);

        if (options.returnIndex && selection === "-1") {
          resolve(undefined);
        }

        resolve(selection);
      } else {
        if (error && process.env.NODE_ENV === "development") {
          console.error(error.stack);
        }

        resolve(undefined);
      }
    });
  });
