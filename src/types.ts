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

export type FileToolInvocation = {
  tool: "file.tool";
  mode: "save" | "open";
  title: string;
  directory: string;
};

export type AlertToolInvocation = {
  tool: "alert.tool";
  title: string;
  text: string;
  button1: string;
  button2: string;
};

export type ToolInvocation =
  | GenericToolInvocation
  | DisplayToolInvocation
  | PromptToolInvocation
  | FileToolInvocation
  | AlertToolInvocation;
