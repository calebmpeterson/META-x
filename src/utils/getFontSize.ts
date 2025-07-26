import { getConfigOption } from "./getConfigOption";

const CONFIG_FONT_SIZE_KEY = "font-size";
const DEFAULT_FONT_SIZE = "16";

export const getFontSize = () =>
  getConfigOption(CONFIG_FONT_SIZE_KEY, DEFAULT_FONT_SIZE);
