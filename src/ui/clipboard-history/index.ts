import _ from "lodash";
import finishClipboard from "../../clipboard/finish";
import { setClipboardContent } from "../../clipboard/utils";
import { getClipboardHistory } from "../../state/clipboardHistory";
import { choose } from "../../utils/choose";

const formatHistoryEntry = (entry: string) => {
  const firstLine = entry.includes("\n")
    ? _.truncate(
        entry.split("\n").find((line) => !_.isEmpty(line)),
        { length: 50 },
      )
    : _.truncate(entry, { length: 50 });

  return _.trim(firstLine);
};

export const runClipboardHistory = async () => {
  const history = getClipboardHistory();

  const historyItems = _.map(history, (entry) => formatHistoryEntry(entry));

  const index = await choose(historyItems, {
    returnIndex: true,
    placeholder: "Clipboard history",
  });

  if (index) {
    const indexAsNumber = parseInt(index, 10);
    const selection = history[indexAsNumber];

    if (selection) {
      await setClipboardContent(selection);
      await finishClipboard();
    }
  }
};
