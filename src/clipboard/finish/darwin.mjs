import { keyboard, Key } from "@nut-tree/nut-js";
import { delay } from "../../utils.mjs";

export default async () => {
  await delay(20);
  await keyboard.type(Key.LeftSuper, Key.V);
};
