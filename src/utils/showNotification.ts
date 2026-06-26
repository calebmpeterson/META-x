import { runAppleScript } from "run-applescript";
import { TITLE } from "../constants";

interface Options {
  message: string;
  title?: string;
  subtitle?: string;
}

const escape = (s: string) => s.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

export const showNotification = ({
  message,
  title = TITLE,
  subtitle,
}: Options) => {
  let script = `display notification "${escape(message)}" with title "${escape(title)}"`;
  if (subtitle) script += ` subtitle "${escape(subtitle)}"`;
  runAppleScript(script);
};
