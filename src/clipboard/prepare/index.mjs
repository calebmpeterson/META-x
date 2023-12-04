import prepareDarwin from './darwin.mjs';

export default () =>
  process.platform === "darwin" ? prepareDarwin() : Promise.resolve();
