import fs from "fs";
import _ from "lodash";
import { openApp } from "open";
import path from "path";
import { getConfigDir } from "../utils/getConfigDir";
import { getConfigOption } from "../utils/getConfigOption";
import { logger } from "../utils/logger";
import { APPLICATION_PREFIX } from "./_constants";
import { ApplicationLauncher } from "./types";

const getApplicationUsageHistory = () =>
  path.join(getConfigDir(), ".application-usage");

const persistApplicationUsage = (values: string[]) => {
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

const trackApplicationUsage = (value: string) => {
  const history = restoreApplicationUsage();
  persistApplicationUsage([...history, value]);
};

const DEFAULT_IGNORED: string[] = [];

export const getApplications = (
  rootDir = "/Applications"
): ApplicationLauncher[] => {
  const history = restoreApplicationUsage();
  const scores = _.countBy(history, _.identity);
  const ignored = getConfigOption("ignored", DEFAULT_IGNORED);

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
    .filter((filename) => !filename.startsWith("."))
    .filter((filename) => !ignored.some((ignore) => filename.includes(ignore)));

  const items = applications.map((application) => {
    const value = path.join(rootDir, application);
    const name = _.get(path.parse(application), "name", application);
    return {
      prefix: APPLICATION_PREFIX,
      title: name,
      value,
      score: scores[value] ?? 0,
      invoke: async () => {
        logger.log(`Opening ${application}`);
        trackApplicationUsage(value);
        await openApp(value);
      },
    };
  });

  return items;
};
