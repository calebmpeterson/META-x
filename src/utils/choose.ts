import { exec } from "child_process";
import _ from "lodash";

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui

type ChooseResult = string | undefined;

export const choose = (options: string[]) =>
  new Promise<ChooseResult>((resolve, reject) => {
    const choices = options.join("\n");
    const toShow = Math.max(5, Math.min(40, _.size(options)));
    const cmd = `echo "${choices}" | choose -b 000000 -c 222222 -w 30 -s 18 -m -n ${toShow}`;

    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const selection = _.trim(stdout);

        resolve(selection);
      } else {
        if (error && process.env.NODE_ENV === "development") {
          console.error(error.stack);
        }

        resolve(undefined);
      }
    });
  });
