declare module "cocoa-dialog" {
  export default function cocoaDialog(
    type: "msgbox" | "filesave" | "fileselect",
    options: Record<string, unknown>
  ): Promise<string>;
}
