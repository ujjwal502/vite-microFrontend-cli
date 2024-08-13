#!/usr/bin/env node
import { Command } from "commander";
import { setupHostApplication } from "../src/commands/setupHostApplication.js";
import { createMicrofrontendProjects } from "../src/commands/createMicrofrontends.js";
import { promptForProjectNames } from "../src/commands/promptProjectNames.js";

const program = new Command();

program
  .version("1.0.0")
  .argument("<main-project-name>", "Name of the main project")
  .option("-n, --number <number>", "Number of microfrontends", "1")
  .action(async (mainProjectName, options) => {
    const numOfProjects = parseInt(options.number, 10);
    const projectNames = await promptForProjectNames(numOfProjects);
    createMicrofrontendProjects(mainProjectName, projectNames);
    setupHostApplication(mainProjectName, projectNames);
  });

program.parse(process.argv);
