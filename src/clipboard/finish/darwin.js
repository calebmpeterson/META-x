const runApplescript = require("run-applescript");

const script = `tell application "System Events" to keystroke "v" using command down`;

module.exports = () => runApplescript(script);
