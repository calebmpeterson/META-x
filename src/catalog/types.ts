export type Command = {
  title: string;
  isFallback?: boolean;
};

export type BuiltInCommand = Command & {
  value: (selection: string) => string;
};
