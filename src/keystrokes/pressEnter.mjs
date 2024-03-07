import { keyboard, Key } from "@nut-tree/nut-js";
import { delay } from "../utils/delay.mjs";

export default async () => {
  console.log("pressEnter");
  await delay(1000);
  await keyboard.pressKey(Key.Enter);
  await delay(10);
  await keyboard.releaseKey(Key.Enter);
};
