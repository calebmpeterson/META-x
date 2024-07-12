import { keyboard, Key } from "@nut-tree/nut-js";
import { delay } from "../../utils/delay.mjs";
import { clock } from "../../utils/clock.mjs";

export default clock("prepare", async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
});
