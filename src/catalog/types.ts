export type Command = {
  title: string;
  isFallback?: boolean;
};

export type BuiltInCommand = Command & {
  value: (selection: string) => string;
};

export type ScriptCommand = Command & {
  value: string;
};

export type ApplicationLauncher = Command & {
  value: string;
  score: number;
  invoke: () => Promise<void>;
};
