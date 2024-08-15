import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

export function setupParentFolder(mainProjectName, projectNames) {
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
    },
  };

  writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  execSync("npm install concurrently --save-dev", { stdio: "inherit" });

  console.log(`Parent folder setup completed for ${parentDir}`);
  console.log("Verifying package.json for each project:");

  //   verifyPackageJson function is for debugging. Please ignore

  //   const verifyPackageJson = (projectPath) => {
  //     const packageJsonPath = join(process.cwd(), projectPath, "package.json");
  //     if (!existsSync(packageJsonPath)) {
  //       console.error(`ERROR: package.json not found for ${projectPath}`);
  //       return;
  //     }
  //     const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  //     console.log(`\nPackage.json for ${projectPath}:`);
  //     console.log(JSON.stringify(packageJson, null, 2));

  //     // Check if build script exists
  //     if (!packageJson.scripts || !packageJson.scripts.build) {
  //       console.error(
  //         `ERROR: 'build' script not found in package.json for ${projectPath}`
  //       );
  //     }
  //   };

  //   verifyPackageJson(`${mainProjectName}-host`);
  //   fullProjectNames.forEach((name) => verifyPackageJson(name));

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
}
