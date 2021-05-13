const { exec } = require("child_process");
const _ = require("lodash");

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
module.exports = (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const toShow = Math.min(20, _.size(commands));
    const cmd = `echo "${choices}" | choose -c highlight=000000 -s 18 -m -n ${toShow}`;
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = _.trim(stdout);
        const rawQueryCommand = {
          isUnhandled: true,
          query,
        };
        const command =
          commands.find(({ title }) => title === query) || rawQueryCommand;
        resolve(command);
      } else {
        if (error) {
          console.error(error);
        }
        resolve({
          isUnknown: true,
        });
      }
    });
  });
