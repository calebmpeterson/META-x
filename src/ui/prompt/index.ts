import { Command } from "../../catalog/types";
import promptDarwin from "./darwin";

export default (commands: Command[]) => promptDarwin(commands);
