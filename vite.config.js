/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
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


const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(
        /\b(src|href)\s*=\s*"(\/[^"]*)"/g,
        (m, attr, path) => {
          return `${attr}="${'.' + path}"`;
        })
    },
  }
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  if (mode === "production" && !env.VITE_MODEL_NAME) {
    throw new Error("You forgot to add environment variable \"VITE_MODEL_NAME\" to rename the folder as model url in Dassault Systemes production...")
  }

  if (mode === "production") {
    console.clear()
    console.log('----------------------------------------------')
    console.log("Model Name:", env.VITE_MODEL_NAME)
    console.log("Model URL:", env.VITE_BASE_URL)
    console.log('----------------------------------------------')
  }

  return {
    plugins: [react(), svgr(), tailwindcss(), glsl(), mode === "production" && htmlPlugin()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@three-math': path.resolve(dirname, './node_modules/three/src/math'),
        '@three-extras': path.resolve(dirname, './node_modules/three/examples/jsm')
      },
    },
    assetsInclude: ['public/**/*.glb', 'public/**/*.gltf'],
    build: {
      outDir: mode === "production" ? env.VITE_MODEL_NAME : "dist",
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) => {
            return `[name]-${randomHash()}.js`;
          }
        }
      },
      sourcemap: env.SOURCEMAP === 'true' ? true : false
    },
    preview: {
      port: env.VITE_BASE_URL.match(/:(\d+)/) ? env.VITE_BASE_URL.match(/:(\d+)/)[1] : 4173
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
  }
});