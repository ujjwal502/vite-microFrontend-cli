import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

export function setupMicrofrontendArchitecture(projectDir, projectName, index) {
  const viteConfigPath = join(projectDir, "vite.config.js");
  const componentDir = join(projectDir, "src/components");
  const componentPath = join(componentDir, "Component.jsx");

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
          './Component': './src/components/Component.jsx',
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
