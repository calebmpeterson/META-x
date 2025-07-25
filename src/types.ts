export type ShortcutResult = {
  shortcut: string;
  input?: string;
};

type GenericToolInvocation = {
  tool: string;
};

export type DisplayToolInvocation = {
  tool: "display.tool";
  message: string;
  timeout?: string | number;
};

export type ToolInvocation = GenericToolInvocation | DisplayToolInvocation;
