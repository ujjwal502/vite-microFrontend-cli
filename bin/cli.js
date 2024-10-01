#!/usr/bin/env node
import { Command } from "commander";
import { mkdirSync } from "fs";
import inquirer from "inquirer";
import { setupHostApplication } from "../src/commands/setupHostApplication.js";
import { createMicrofrontendProjects } from "../src/commands/createMicrofrontends.js";
import { promptForProjectNames } from "../src/commands/promptProjectNames.js";
import { setupParentFolder } from "../src/commands/setupParentFolder.js";

const program = new Command();

program
  .version("1.0.0")
  .argument("<main-project-name>", "Name of the main project")
  .option("-n, --number <number>", "Number of microfrontends", "1")
  .action(async (mainProjectName, options) => {
    const numOfProjects = parseInt(options.number, 10);

    const { useTypeScript } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useTypeScript",
        message: "Do you want to use TypeScript for your projects?",
        default: false,
      },
    ]);

    const projectNames = await promptForProjectNames(numOfProjects);

    const parentDir = `${mainProjectName}-workspace`;
    mkdirSync(parentDir);
    process.chdir(parentDir);

    await createMicrofrontendProjects(
      mainProjectName,
      projectNames,
      useTypeScript
    );
    await setupHostApplication(mainProjectName, projectNames, useTypeScript);
    await setupParentFolder(mainProjectName, projectNames, useTypeScript);

    console.log(`
Setup complete! To get started:

1. cd ${parentDir}
2. npm run install-all
3. npm run build-all
4. npm run preview-all

Check the README.md file for more information.
    `);
  });

program.parse(process.argv);
