import fs from "node:fs";
import path from "node:path";

const applications = fs.readdirSync("/Applications").filter((filename) => {
  const pathname = path.join("/Applications", filename);

  console.log(`Checking access for ${pathname}`);
  try {
    fs.accessSync(pathname, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
});

console.log(applications);
