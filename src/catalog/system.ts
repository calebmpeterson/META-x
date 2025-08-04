import { execa } from "execa";
import { SYSTEM_PREFIX } from "./_constants";
import { SystemCommand } from "./types";

export const getSystemCommands = (): SystemCommand[] => [
  {
    prefix: SYSTEM_PREFIX,
    title: `Sleep`,
    invoke: async () => {
      await execa("pmset", ["sleepnow"]);
    },
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `Sleep Displays`,
    invoke: async () => {
      await execa("pmset", ["displaysleepnow"]);
    },
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `About This Mac`,
    invoke: async () => {
      await execa("open", ["-a", "About This Mac"]);
    },
  },
  {
    prefix: SYSTEM_PREFIX,
    title: `Lock Displays`,
    invoke: async () => {
      await execa("open", [
        "-a",
        "/System/Library/CoreServices/ScreenSaverEngine.app",
      ]);
    },
  },
];
