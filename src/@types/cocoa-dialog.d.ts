declare module "cocoa-dialog" {
  export default function cocoaDialog(
    type: "msgbox",
    options: Record<string, unknown>
  ): Promise<string>;
}
