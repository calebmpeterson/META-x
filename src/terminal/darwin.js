const { exec } = require("child_process");

// Uses choose: https://github.com/chipsenkbeil/choose
// brew install choose-gui
module.exports = (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const cmd = `echo "${choices}" | choose -c highlight=000000`;
    const proc = exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        const query = stdout;
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
