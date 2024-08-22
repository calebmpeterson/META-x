import startup from "user-startup";

const CWD = process.cwd();

startup.remove("META-x");

startup.create(
  "META-x",
  `/usr/local/bin/node`,
  [`${CWD}/bin/runner.mjs`],
  `${CWD}/runner.log`,
);
