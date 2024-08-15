import { execSync } from "child_process";
import { join } from "path";
import { writeFileSync } from "fs";

export function setupHostApplication(mainProjectName, projectNames) {
  const clonedProjectNames = structuredClone(projectNames);
  const capitalizedNames = clonedProjectNames.map((name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  const hostDir = `${mainProjectName}-host`;
  execSync(`npm create vite@latest ${hostDir} -- --template react`, {
    stdio: "inherit",
  });

  // Change to the host directory
  process.chdir(hostDir);

  // Install @originjs/vite-plugin-federation
  console.log("Installing @originjs/vite-plugin-federation...");
  try {
    execSync("npm install @originjs/vite-plugin-federation --save-dev", {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Failed to install @originjs/vite-plugin-federation:", error);
    return;
  }

  const viteConfigPath = join(process.cwd(), "vite.config.js");
  const appPath = join(process.cwd(), "src/App.jsx");
  const packageJsonPath = join(process.cwd(), "package.json");

  const remoteEntries = capitalizedNames
    .map(
      (name, index) =>
        `${name}: 'http://localhost:300${index + 2}/assets/remoteEntry${
          index + 1
        }.js'`
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
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    preview: {
      port: 3001,
      strictPort: true,
    },
  });
    `;

  const imports = projectNames
    .map(
      (name) =>
        `const ${
          name.charAt(0).toUpperCase() + name.slice(1)
        } = React.lazy(() => import('${
          name.charAt(0).toUpperCase() + name.slice(1)
        }/Component'));`
    )
    .join("\n");

  const appCode = `
  import React, { Suspense } from 'react';
  
  ${imports}
  
  function App() {
    return (
      <div>
        <h1>Main Host Application</h1>
        ${capitalizedNames
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

  // Change back to the original directory
  process.chdir("..");

  console.log(`Host application setup completed for ${hostDir}`);
}
