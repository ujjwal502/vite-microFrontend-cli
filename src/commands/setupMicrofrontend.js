import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";

export function setupMicrofrontendArchitecture(projectDir, projectName) {
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
