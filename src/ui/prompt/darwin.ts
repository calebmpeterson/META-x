import _ from "lodash";
import { Command } from "../../catalog/types";
import { getFontName } from "../../utils/getFontName";
import { getFontSize } from "../../utils/getFontSize";
import { logger } from "../../utils/logger";
import { SpawnCache } from "../../utils/SpawnCache";
import { PromptResult } from "./types";

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
const choose = new SpawnCache("choose", [
  `-f`,
  getFontName(),
  "-b",
  "000000",
  "-c",
  "222222",
  "-w",
  "30",
  "-s",
  getFontSize(),
  "-m",
  "-n",
  "30",
  "-p",
  "Run a command or open an application",
]);

export default (commands: Command[]) =>
  new Promise<PromptResult>(async (resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const toShow = Math.min(30, _.size(commands));
    const cmd = `choose -f "${getFontName()}" -b 000000 -c 222222 -w 30 -s ${getFontSize()} -m -n ${toShow} -p "Run a command or open an application"`;

    const { stdout = "", stderr } = await choose.run(choices);

    if (stdout.trim().length > 0) {
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
      if (stderr && process.env.NODE_ENV === "development") {
        logger.error(stderr);
      }

      resolve({
        isUnknown: true,
      });
    }
  });
