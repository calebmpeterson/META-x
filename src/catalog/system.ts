import { execa } from "execa";
import { SYSTEM_PREFIX } from "./_constants";

export const getSystemCommands = () => [
  {
    title: `${SYSTEM_PREFIX} Shutdown`,
    invoke: async () => {
      await execa("pmset", ["halt"]);
    },
  },
  {
    title: `${SYSTEM_PREFIX} Restart`,
    invoke: async () => {
      await execa("pmset", ["restart"]);
    },
  },
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
  {
    title: `${SYSTEM_PREFIX} Lock Screen`,
    invoke: async () => {
      await execa("open", [
        "-a",
        "/System/Library/CoreServices/ScreenSaverEngine.app",
      ]);
    },
  },
];
