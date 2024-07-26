import prepareDarwin from "./darwin";

export default () =>
  process.platform === "darwin" ? prepareDarwin() : Promise.resolve();
