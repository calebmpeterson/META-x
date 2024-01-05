import { execa } from "execa";

export const getSystemCommands = () => [
  {
    title: "⚙︎ Sleep",
    invoke: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    title: "⚙︎ Sleep Displays",
    invoke: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
];
