#!/usr/bin/env node

const { Command } = require("commander");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const program = new Command();

program
  .version("1.0.0")
  .argument("<project-name>", "Name of the main project")
  .option("-n, --number <number>", "Number of microfrontends", "1")
  .action((projectName, options) => {
    const numOfProjects = parseInt(options.number, 10);
    createMicrofrontendProjects(projectName, numOfProjects);
  });

program.parse(process.argv);

function createMicrofrontendProjects(mainProjectName, numOfProjects) {
  console.log(`Creating ${numOfProjects} microfrontend projects using Vite...`);

  for (let i = 0; i < numOfProjects; i++) {
    const projectDir = `${mainProjectName}-microfrontend-${i + 1}`;
    execSync(`npm create vite@latest ${projectDir} -- --template react`, {
      stdio: "inherit",
    });

    setupMicrofrontendArchitecture(projectDir, i + 1);
  }
}

function setupMicrofrontendArchitecture(projectDir, projectNumber) {
  const viteConfigPath = path.join(projectDir, "vite.config.js");

  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'app${projectNumber}',
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

  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log(`Microfrontend setup completed for ${projectDir}`);
}
