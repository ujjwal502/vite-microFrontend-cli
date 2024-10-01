import { join } from "path";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

export function setupMicrofrontendArchitecture(
  projectDir,
  projectName,
  index,
  useTypeScript
) {
  const viteConfigPath = join(
    projectDir,
    useTypeScript ? "vite.config.ts" : "vite.config.js"
  );
  const componentDir = join(projectDir, "src/components");
  const fileExtension = useTypeScript ? "tsx" : "jsx";
  const componentPath = join(componentDir, `Component.${fileExtension}`);

  // Ensure that the src/components directory exists
  mkdirSync(componentDir, { recursive: true });

  // Install @originjs/vite-plugin-federation
  console.log(`Installing dependencies for ${projectName}...`);
  try {
    execSync("npm install @originjs/vite-plugin-federation --save-dev", {
      cwd: projectDir,
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Failed to install @originjs/vite-plugin-federation:", error);
    return;
  }

  const viteConfig = `
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import federation from '@originjs/vite-plugin-federation';
  
  export default defineConfig({
    plugins: [
      react(),
      federation({
        name: '${projectName}',
        filename: 'remoteEntry${index + 1}.js',
        exposes: {
          './Component': './src/components/Component.${fileExtension}',
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
      port: 300${index + 1},
      strictPort: true,
    },
    preview: {
      port: 300${index + 2},
      strictPort: true,
    },
  });
    `;

  const componentCode = useTypeScript
    ? `
  import React from 'react';
  
  const Component: React.FC = () => {
    return (
      <div>
        <h2>This is the ${projectName} Microfrontend</h2>
      </div>
    );
  }
  
  export default Component;
    `
    : `
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

  if (useTypeScript) {
    // Update package.json to include type-check script
    const packageJsonPath = join(projectDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts["type-check"] = "tsc --noEmit";
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Install TypeScript if not already installed
    try {
      execSync(
        "npm install --save-dev typescript @types/react @types/react-dom",
        { cwd: projectDir, stdio: "inherit" }
      );
    } catch (error) {
      console.error("Failed to install TypeScript dependencies:", error);
    }

    // Create tsconfig.json if it doesn't exist
    const tsconfigPath = join(projectDir, "tsconfig.json");
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

  console.log(`Microfrontend setup completed for ${projectDir}`);
}
