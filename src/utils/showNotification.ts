import notifier from "node-notifier";
import { TITLE } from "../constants";

interface Options {
  message: string;
}

export const showNotification = ({ message }: Options) => {
  notifier.notify({
    title: TITLE,
    message,
  });
};
