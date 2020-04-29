const fs = require("fs");
const os = require("os");
const path = require("path");
const { merge } = require("lodash");

const DEFAULT_CONFIG = {
  hotkey: "Alt+X",
};

const getConfigDir = () => path.join(os.homedir(), ".meta-x");

const getConfig = () => {
  const configFilename = path.join(getConfigDir(), "config.json");
  try {
    const configJSON = fs.readFileSync(configFilename, "UTF-8");
    return merge({}, DEFAULT_CONFIG, JSON.parse(configJSON));
  } catch (e) {
    console.warn(`Failed to read config from ${configFilename}`);
    return DEFAULT_CONFIG;
  }
};

module.exports = {
  getConfigDir,
  getConfig,
};
