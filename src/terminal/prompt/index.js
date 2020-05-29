const promptDarwin = require("./darwin");
const promptLinux = require("./linux");

module.exports = (...args) =>
  process.platform === "darwin" ? promptDarwin(...args) : promptLinux(...args);
