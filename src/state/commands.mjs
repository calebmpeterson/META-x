let commandsState = [];

export const getCommandsCatalog = () => commandsState;

export const setCommandsCatalog = (newCommandsState) => {
  commandsState = newCommandsState;
};
