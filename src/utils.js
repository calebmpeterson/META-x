const os = require("os");
const path = require("path");

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

module.exports = {
  getConfigDir,
};
