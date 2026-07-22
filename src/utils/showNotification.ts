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
  const script = subtitle
    ? `display notification "${escape(message)}" with title "${escape(title)}" subtitle "${escape(subtitle)}"`
    : `display notification "${escape(message)}" with title "${escape(title)}"`;
  runAppleScript(script);
};
