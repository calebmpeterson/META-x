import promptDarwin from './darwin.mjs';
import promptLinux from './linux.mjs';

export default (...args) =>
  process.platform === "darwin" ? promptDarwin(...args) : promptLinux(...args);
