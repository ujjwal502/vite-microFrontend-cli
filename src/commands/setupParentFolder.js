import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

export function setupParentFolder(
  mainProjectName,
  projectNames,
  useTypeScript
) {
  const parentDir = process.cwd();

  const fullProjectNames = projectNames.map(
    (name) => `${mainProjectName}-${name}`
  );

  const packageJson = {
    name: `${mainProjectName}-workspace`,
    version: "1.0.0",
    private: true,
    workspaces: [`${mainProjectName}-host`, ...fullProjectNames],
    scripts: {
      "install-all": "npm install && npm run install-workspaces",
      "install-workspaces": `npm install --workspace=${mainProjectName}-host ${fullProjectNames
        .map((name) => `--workspace=${name}`)
        .join(" ")}`,
      "build-all": `npm run build --workspace=${mainProjectName}-host ${fullProjectNames
        .map((name) => `--workspace=${name}`)
        .join(" ")}`,
      "preview-all": `concurrently "npm run preview --workspace=${mainProjectName}-host" ${fullProjectNames
        .map((name) => `"npm run preview --workspace=${name}"`)
        .join(" ")}`,
      ...(useTypeScript
        ? {
            "type-check": `npm run type-check --workspace=${mainProjectName}-host ${fullProjectNames
              .map((name) => `--workspace=${name}`)
              .join(" ")}`,
          }
        : {}),
    },
  };

  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  execSync("npm install concurrently --save-dev", { stdio: "inherit" });

  if (useTypeScript) {
    console.log("Installing TypeScript dependencies...");
    execSync(
      "npm install typescript @types/react @types/react-dom --save-dev",
      { stdio: "inherit" }
    );
  }

  console.log(`Parent folder setup completed for ${parentDir}`);

  console.log("Installing dependencies for all projects...");
  try {
    execSync("npm run install-all", { stdio: "inherit" });
    console.log("All dependencies installed successfully.");
  } catch (error) {
    console.error("Failed to install dependencies:", error);
  }

  console.log("Attempting to run build-all...");
  try {
    const buildOutput = execSync("npm run build-all", { encoding: "utf8" });
    console.log("Build output:", buildOutput);
  } catch (error) {
    console.error("Error during build-all:", error.message);
    if (error.stdout) console.log("Build stdout:", error.stdout);
    if (error.stderr) console.log("Build stderr:", error.stderr);
  }

  if (useTypeScript) {
    console.log("Running type-check...");
    try {
      const typeCheckOutput = execSync("npm run type-check", {
        encoding: "utf8",
      });
      console.log("Type-check output:", typeCheckOutput);
    } catch (error) {
      console.error("Error during type-check:", error.message);
      if (error.stdout) console.log("Type-check stdout:", error.stdout);
      if (error.stderr) console.log("Type-check stderr:", error.stderr);
    }
  }
}
