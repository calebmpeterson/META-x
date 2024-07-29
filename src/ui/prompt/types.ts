import { Command } from "../../catalog/types";

export type PromptResult =
  | Command
  | { isUnknown: true }
  | { isUnhandled: boolean; query: string };
