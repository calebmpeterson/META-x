import { execa } from "execa";

export const getSystemCommands = () => [
  {
    title: "⚙︎ Sleep",
    isApplication: true,
    execute: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: "⚙︎ Sleep Displays",
    isApplication: true,
    execute: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
];
