const runApplescript = require("run-applescript");

const script = `
tell application "System Events"
   keystroke "c" using command down
end tell
`;
module.exports = () => runApplescript(script);
