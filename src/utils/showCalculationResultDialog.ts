import { invokeNativeTool } from "./invokeNativeTool";

export const showCalculationResultDialog = async (
  query: string,
  result: string
) => {
  invokeNativeTool({
    tool: "display.tool",
    message: `${query} = ${result}`,
    timeout: 5,
  });
};
