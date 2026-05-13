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

export type PromptFieldKind = "string" | "text";

export type PromptToolInvocation = {
  tool: "prompt.tool";
  fields: Record<string, PromptFieldKind>;
};

export type ToolInvocation =
  | GenericToolInvocation
  | DisplayToolInvocation
  | PromptToolInvocation;
