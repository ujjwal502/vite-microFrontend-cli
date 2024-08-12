#!/usr/bin/env node
import { Command } from "commander";
import { createPromptModule } from "inquirer";
import { execSync } from "child_process";
import { join } from "path";
import { writeFileSync } from "fs";

const program = new Command();
const prompt = createPromptModule();

program
  .version("1.0.0")
  .argument("<main-project-name>", "Name of the main project")
  .option("-n, --number <number>", "Number of microfrontends", "1")
  .action(async (mainProjectName, options) => {
    const numOfProjects = parseInt(options.number, 10);
    const projectNames = await promptForProjectNames(numOfProjects);
    createMicrofrontendProjects(mainProjectName, projectNames);
  });

program.parse(process.argv);

async function promptForProjectNames(numOfProjects) {
  const questions = [];

  for (let i = 0; i < numOfProjects; i++) {
    questions.push({
      type: "input",
      name: `project${i + 1}`,
      message: `Enter name for microfrontend project ${i + 1}:`,
      default: `microfrontend-${i + 1}`,
    });
  }

  const answers = await prompt(questions);
  return Object.values(answers);
}

function createMicrofrontendProjects(mainProjectName, projectNames) {
  console.log(
    `Creating ${projectNames.length} microfrontend projects using Vite...`
  );

  projectNames.forEach((projectName, index) => {
    const projectDir = `${mainProjectName}-${projectName}`;
    execSync(`npm create vite@latest ${projectDir} -- --template react`, {
      stdio: "inherit",
    });

    setupMicrofrontendArchitecture(projectDir, projectName);
  });
}

function setupMicrofrontendArchitecture(projectDir, projectName) {
  const viteConfigPath = join(projectDir, "vite.config.js");

  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '${projectName}',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.jsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext'
  }
});
  `;

  writeFileSync(viteConfigPath, viteConfig);
  console.log(`Microfrontend setup completed for ${projectDir}`);
}
