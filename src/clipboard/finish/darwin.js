const { keyboard, Key } = require("@nut-tree/nut-js");
const { delay } = require("../../utils");

module.exports = async () => {
  await delay(100);
  await keyboard.type(Key.LeftSuper, Key.V);
};
