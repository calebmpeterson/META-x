import fs from "fs";
import path from "path";
import _ from "lodash";
import { openApp } from "open";
import { getConfigDir } from "../utils/getConfigDir.mjs";

const getApplicationUsageHistory = () =>
  path.join(getConfigDir(), ".application-usage");

const persistApplicationUsage = (values) => {
  fs.writeFileSync(
    getApplicationUsageHistory(),
    _.takeRight(values, 100).join("\n"),
    "utf8"
  );
};

const restoreApplicationUsage = () => {
  try {
    return fs.readFileSync(getApplicationUsageHistory(), "utf8").split("\n");
  } catch {
    // The file doesn't exist yet
    return [];
  }
};

const trackApplicationUsage = (value) => {
  const history = restoreApplicationUsage();
  persistApplicationUsage([...history, value]);
};

export const getApplications = (rootDir = "/Applications") => {
  const history = restoreApplicationUsage();
  const scores = _.countBy(history, _.identity);

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
        return false;
      }
    })
    .filter((filename) => !filename.startsWith("."));

  const items = applications.map((application) => {
    const value = path.join(rootDir, application);
    return {
      title: `⌬ ${_.get(path.parse(application), "name", application)}`,
      value,
      score: scores[value] ?? 0,
      invoke: async () => {
        console.log(`Opening ${application}`);
        trackApplicationUsage(value);
        await openApp(value);
      },
    };
  });

  return items;
};
