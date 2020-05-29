const prepareDarwin = require("./darwin");

module.exports = () =>
  process.platform === "darwin" ? prepareDarwin() : Promise.resolve();
