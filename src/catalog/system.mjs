import { execa } from "execa";
import { SYSTEM_PREFIX } from "./_constants.mjs";

export const getSystemCommands = () => [
  {
    title: `${SYSTEM_PREFIX} Sleep`,
    invoke: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: `${SYSTEM_PREFIX} Sleep Displays`,
    invoke: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
  {
    title: `${SYSTEM_PREFIX} About This Mac`,
    invoke: async () => {
      await execa("open", ["-a", "About This Mac"]);
    },
  },
];
