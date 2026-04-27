#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { Command } from "commander";

export const createCli = (): Command => {
  const program = new Command();

  program
    .name("api-security-scanner")
    .description("CLI bootstrap for API security scanner")
    .version("0.1.0")
    .action(() => {
      console.log("scanner started");
    });

  return program;
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  const program = createCli();
  program.parse(process.argv);
}
