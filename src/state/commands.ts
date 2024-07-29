import { Command } from "../catalog/types";

let commandsState: Command[] = [];

export const getCommandsCatalog = () => commandsState;

export const setCommandsCatalog = (newCommandsState: Command[]) => {
  commandsState = newCommandsState;
};
