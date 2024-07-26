import { Command } from "../../catalog/types";
import promptDarwin from "./darwin";
import promptLinux from "./linux";

export default (commands: Command[]) =>
  process.platform === "darwin"
    ? promptDarwin(commands)
    : promptLinux(commands);
