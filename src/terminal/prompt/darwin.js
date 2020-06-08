const { exec } = require("child_process");
const _ = require("lodash");

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
module.exports = (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const cmd = `echo "${choices}" | choose -c highlight=000000 -s 18 -m`;
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = _.trim(stdout);
        resolve(commands.find(({ title }) => title === query));
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
