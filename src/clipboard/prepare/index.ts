import { updateClipboardHistory } from "../../state/clipboardHistory";
import { getClipboardContent } from "../utils";
import prepareDarwin from "./darwin";

export default async () => {
  // Capture the clipboard content to the clipboard history
  updateClipboardHistory(await getClipboardContent());

  // Prepare the clipboard for the next command
  return process.platform === "darwin" ? prepareDarwin() : Promise.resolve();
};
