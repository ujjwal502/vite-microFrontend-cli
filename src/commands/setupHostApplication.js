import { execSync } from "child_process";
import { join } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";

function createRemotesDeclaration(projectNames, hostDir) {
  const declarations = projectNames
    .map((name) => `declare module '${name}/Component';`)
    .join("\n");

  const remotesDtsPath = join(hostDir, "src", "remotes.d.ts");
  writeFileSync(remotesDtsPath, declarations);
  console.log(`Created remotes.d.ts file at ${remotesDtsPath}`);
}

export function setupHostApplication(
  mainProjectName,
  projectNames,
  useTypeScript
) {
  const clonedProjectNames = structuredClone(projectNames);
  const capitalizedNames = clonedProjectNames.map((name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  const hostDir = `${mainProjectName}-host`;
  const template = useTypeScript ? "react-ts" : "react";
  execSync(`npm create vite@latest ${hostDir} -- --template ${template}`, {
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

  const viteConfigPath = join(
    process.cwd(),
    useTypeScript ? "vite.config.ts" : "vite.config.js"
  );
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  const appPath = join(process.cwd(), `src/App.${fileExtension}`);

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

  // Create remotes.d.ts file
  if (useTypeScript) {
    createRemotesDeclaration(capitalizedNames, process.cwd());
  }

  if (useTypeScript) {
    // Update package.json to include type-check script
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts["type-check"] = "tsc --noEmit";
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Install TypeScript if not already installed
    try {
      execSync(
        "npm install --save-dev typescript @types/react @types/react-dom",
        { stdio: "inherit" }
      );
    } catch (error) {
      console.error("Failed to install TypeScript dependencies:", error);
    }

    // Create tsconfig.json if it doesn't exist
    const tsconfigPath = join(process.cwd(), "tsconfig.json");
    if (!existsSync(tsconfigPath)) {
      const tsconfig = {
        compilerOptions: {
          target: "ESNext",
          useDefineForClassFields: true,
          lib: ["DOM", "DOM.Iterable", "ESNext"],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: false,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: "ESNext",
          moduleResolution: "Node",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }],
      };
      writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    }
  }

  // Change back to the original directory
  process.chdir("..");

  console.log(`Host application setup completed for ${hostDir}`);
}
