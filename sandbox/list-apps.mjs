import fs from "node:fs";
import path from "node:path";

const rootDir = "/System/Applications";

const applications = fs
  .readdirSync(rootDir)
  .filter((filename) => {
    const pathname = path.join(rootDir, filename);
    const stats = fs.statSync(pathname);
    if (stats.isDirectory() && !filename.endsWith(".app")) {
      return false;
    }

    try {
      // If this doesn't throw, then the file is executable
      fs.accessSync(pathname, fs.constants.X_OK);
      return true;
    } catch {
      console.log(filename, "is not executable");
      return false;
    }
  })
  .filter((filename) => !filename.startsWith("."));

console.log(applications);
