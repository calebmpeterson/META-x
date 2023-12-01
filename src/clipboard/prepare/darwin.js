const { keyboard, Key } = require("@nut-tree/nut-js");
const { delay } = require("../../utils");

module.exports = async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(100);
};
