import { exec } from "child_process";
import _ from "lodash";

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
export default (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const toShow = Math.min(20, _.size(commands));
    const cmd = `echo "${choices}" | choose -b 000000 -c 222222 -w 30 -s 18 -m -n ${toShow}`;

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
          console.error(error.stack);
        }
        resolve({
          isUnknown: true,
        });
      }
    });
  });
