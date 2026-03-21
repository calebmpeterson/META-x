import fs from "node:fs";
import { PromptResult } from "../ui/prompt/types";
import { logger } from "./logger";

export const logSelection = (selection: PromptResult) => {
  if ("isUnknown" in selection && selection.isUnknown) {
    return;
  }

  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join(".");
  const time = [now.getHours(), now.getMinutes()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  const label = "title" in selection ? selection.title : "unknown";

  const asCSV = `${date},${time},${label}`;

  fs.appendFile("./usage.log", `${asCSV}\n`, "utf8", (error) => {
    if (error) {
      logger.error("Failed to append selection to usage.log", error);
    }
  });
};
