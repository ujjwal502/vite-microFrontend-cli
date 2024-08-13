#!/usr/bin/env node
import { Command } from "commander";
import { createPromptModule } from "inquirer";
import { execSync } from "child_process";
import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

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
    setupHostApplication(mainProjectName, projectNames);
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
  const componentDir = join(projectDir, "src/components");
  const componentPath = join(componentDir, "Component.jsx");

  // Ensure that the src/components directory exists
  mkdirSync(componentDir, { recursive: true });

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
        './Component': './src/components/Component.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
  },
});
  `;

  const componentCode = `
import React from 'react';

const Component = () => {
  return (
    <div>
      <h2>This is the ${projectName} Microfrontend</h2>
    </div>
  );
}

export default Component;
  `;

  writeFileSync(viteConfigPath, viteConfig);
  writeFileSync(componentPath, componentCode);
  console.log(`Microfrontend setup completed for ${projectDir}`);
}

function setupHostApplication(mainProjectName, projectNames) {
  const hostDir = `${mainProjectName}-host`;
  execSync(`npm create vite@latest ${hostDir} -- --template react`, {
    stdio: "inherit",
  });

  const viteConfigPath = join(hostDir, "vite.config.js");
  const appPath = join(hostDir, "src/App.jsx");

  const remoteEntries = projectNames
    .map(
      (name, index) =>
        `${name}: '${name}@http://localhost:300${index + 1}/remoteEntry.js'`
    )
    .join(",\n        ");

  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '${mainProjectName}-host',
      remotes: {
        ${remoteEntries}
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
  },
});
  `;

  const imports = projectNames
    .map(
      (name) => `const ${name} = React.lazy(() => import('${name}/Component'));`
    )
    .join("\n");

  const appCode = `
import React, { Suspense } from 'react';

${imports}

function App() {
  return (
    <div>
      <h1>Main Host Application</h1>
      ${projectNames
        .map(
          (name) =>
            `<Suspense fallback={<div>Loading ${name}...</div>}><${name} /></Suspense>`
        )
        .join("\n      ")}
    </div>
  );
}

export default App;
  `;

  writeFileSync(viteConfigPath, viteConfig);
  writeFileSync(appPath, appCode);

  console.log(`Host application setup completed for ${hostDir}`);
}
