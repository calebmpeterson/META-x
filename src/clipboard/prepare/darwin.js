const runApplescript = require("run-applescript");
const { exec } = require("child_process");
const _ = require("lodash");

const OSASCRIPT_PATH = "/usr/bin/osascript";

const osascript = (script, callback = _.noop) =>
  new Promise((resolve, reject) => {
    const cmd = `${OSASCRIPT_PATH} <<EOF\n${script}\nEOF`;
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
        if (error) {
          console.error(error);
        }
        resolve({
          isUnknown: true,
        });
      }
    });
  });

const script = `tell application "System Events" to keystroke "c" using {command down}`;

module.exports = () => osascript(script);
