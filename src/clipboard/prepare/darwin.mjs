import { keyboard, Key } from "@nut-tree/nut-js";
import { delay } from "../../utils/delay.mjs";

export default async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
};
