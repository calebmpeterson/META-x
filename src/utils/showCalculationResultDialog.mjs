import { execa } from "execa";

export const showCalculationResultDialog = async (query, result) => {
  // await cocoaDialog("msgbox", {
  //   title: `META-x`,
  //   text: result,
  //   timeout: 5,
  //   timeoutFormat: " ",
  // });
  await execa("open", [
    "-n",
    "-a",
    "Brave Browser",
    "--args",
    `--app=https://quickulator.cubicle6.com/?code=${encodeURIComponent(query)}`,
  ]);
};
