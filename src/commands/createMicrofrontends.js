import { execSync } from "child_process";
import { setupMicrofrontendArchitecture } from "./setupMicrofrontend.js";

export function createMicrofrontendProjects(
  mainProjectName,
  projectNames,
  useTypeScript
) {
  console.log(
    `Creating ${projectNames.length} microfrontend projects using Vite...`
  );

  projectNames.forEach((projectName, index) => {
    const projectDir = `${mainProjectName}-${projectName}`;
    const template = useTypeScript ? "react-ts" : "react";
    execSync(`npm create vite@latest ${projectDir} -- --template ${template}`, {
      stdio: "inherit",
    });

    setupMicrofrontendArchitecture(
      projectDir,
      projectName,
      index,
      useTypeScript
    );
  });
}
