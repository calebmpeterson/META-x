import { Key, keyboard } from "@nut-tree-fork/nut-js";
import _ from "lodash";
import { Command } from "../../catalog/types";
import { getConfigOption } from "../../utils/getConfigOption";
import { getFontName } from "../../utils/getFontName";
import { getFontSize } from "../../utils/getFontSize";
import { logger } from "../../utils/logger";
import { SpawnCache } from "../../utils/SpawnCache";
import { PromptResult } from "./types";

const PROMPT = "Run a command or open an application";

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
  PROMPT,
]);

const triggerSuperwhisper = async () => {
  await keyboard.type(Key.LeftCmd, Key.Space);
};

export default (commands: Command[]) =>
  new Promise<PromptResult>(async (resolve, reject) => {
    const choices = commands
      .map(({ title, prefix }) => [prefix, title].filter(Boolean).join(" "))
      .join("\n");

    const chooseProcess = choose.run(choices);

    if (getConfigOption("superwhisper", false)) {
      await triggerSuperwhisper();
    }

    const { stdout = "", stderr } = await chooseProcess;

    if (stdout.trim().length > 0) {
      const query = _.trim(stdout);
      const rawQueryCommand = {
        isUnhandled: true,
        query,
      };

      const command =
        commands.find(
          ({ prefix, title, isFallback }) =>
            [prefix, title].filter(Boolean).join(" ") === query && !isFallback
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
