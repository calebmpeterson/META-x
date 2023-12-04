import { exec } from 'child_process';
import _ from 'lodash';

// Uses dmenu
export default (commands) =>
  new Promise((resolve, reject) => {
    const choices = commands.map(({ title }) => title).join("\n");
    const cmd = `echo "${choices}" | dmenu -i -b`;
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
