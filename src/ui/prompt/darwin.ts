import { exec } from "child_process";
import _ from "lodash";
import { Command } from "../../catalog/types";
import { getFontName } from "../../utils/getFontName";
import { getFontSize } from "../../utils/getFontSize";
import { logger } from "../../utils/logger";
import { PromptResult } from "./types";

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
export default (commands: Command[]) =>
  new Promise<PromptResult>((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const toShow = Math.min(30, _.size(commands));
    const cmd = `echo "${choices}" | choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s ${getFontSize()} -m -n ${toShow} -p "Run a command or open an application"`;

    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = _.trim(stdout);
        const rawQueryCommand = {
          isUnhandled: true,
          query,
        };

        const command =
          commands.find(
            ({ title, isFallback }) => title === query && !isFallback
          ) || rawQueryCommand;

        resolve(command);
      } else {
        if (error && process.env.NODE_ENV === "development") {
          logger.error(error.stack);
        }

        resolve({
          isUnknown: true,
        });
      }
    });
  });
