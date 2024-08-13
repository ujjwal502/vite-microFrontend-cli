import { execSync } from "child_process";
import { join } from "path";
import { writeFileSync } from "fs";

export function setupHostApplication(mainProjectName, projectNames) {
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
