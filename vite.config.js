/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'
import glsl from 'vite-plugin-glsl'
import tailwindcss from '@tailwindcss/vite';
import { randomHash } from './src/helpers/utils'

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
// eslint-disable-next-line no-undef
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), svgr(), tailwindcss(), glsl()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@three-math': path.resolve(dirname, './node_modules/three/src/math'),
      '@three-extras': path.resolve(dirname, './node_modules/three/examples/jsm')
    },
  },
  assetsInclude: ['public/**/*.glb', 'public/**/*.gltf'],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: (chunkInfo) => {
          return `[name]-${randomHash()}.js`;
        }
      }
    }
  },
  test: {
    server: {
      deps: {
        inline: ['vuetify']
      }
    },
    projects: [{
      extends: true,
      plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.js']
      }
    }]
  }
});