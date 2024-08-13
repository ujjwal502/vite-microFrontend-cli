import { execSync } from "child_process";
import { setupMicrofrontendArchitecture } from "./setupMicrofrontend.js";

export function createMicrofrontendProjects(mainProjectName, projectNames) {
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
