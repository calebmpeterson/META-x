import { keyboard, Key } from "@nut-tree-fork/nut-js";
import { delay } from "../../utils/delay";
import { clock } from "../../utils/clock";

export default clock("prepare", async () => {
  await keyboard.type(Key.LeftSuper, Key.C);
  await delay(20);
});
