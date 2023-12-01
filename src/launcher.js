const prepareClipboard = require("./clipboard/prepare");
const finishClipboard = require("./clipboard/finish");
const openTerminal = require("./terminal/main");

const launch = async () => {
  console.log("Meta-x triggered");
  await prepareClipboard();
  const result = await openTerminal();
  if (result) {
    await finishClipboard();
  }
};

launch();
