declare module "cocoa-dialog" {
  export default function cocoaDialog(
    type: "msgbox" | "filesave" | "fileselect" | "textbox" | "progressbar",
    options: Record<string, unknown>
  ): Promise<string>;
}
