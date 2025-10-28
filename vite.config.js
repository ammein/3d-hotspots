/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'
import glsl from 'vite-plugin-glsl'
import tailwindcss from '@tailwindcss/vite';
import { randomHash } from './src/helpers/utils';
import beautify from 'js-beautify';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vite.dev/config/
import path from 'node:path';
import readline from 'node:readline'
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
// eslint-disable-next-line no-undef
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

let desktopRatio = '16 / 9';

let mobileRatio = '9 / 16';


/**
 * Custom HTML Plugin for Dassault Systemes Production
 * @author Amin Shazrin https://github.com/ammein
 * @param {string} mode 
 * @param {string} name 
 * @returns 
 */
const htmlPlugin = () => {
  return {
    name: 'html-transform',
    /**
     * Transform Index HTML
     * @param {string} html 
     * @returns 
     */
    transformIndexHtml(html) {
      html = html.replace('<!-- DASSAULT_SEO_TRACKING_SCRIPT (DON\'T REMOVE THIS) -->', '<script type="text/javascript" src="https://tracking.3ds.com/stat/tc_global_iframe.js"></script>')

      return beautify.html(html.replace(
        /\b(src|href)\s*=\s*"(\/[^"]*)"/g,
        (m, attr, path) => {
          return `${attr}="${'.' + path}"`;
        }), {
        indent_with_tabs: true,
        indent_size: 2,
        max_preserve_newlines: 1
      })
    },
  }
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
/**
 * @author Amin Shazrin https://github.com/ammein
 */
export default defineConfig(async ({ mode }) => {
  // Insert all environment variables into `env`
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // Allow production environment variables that matches with this keys
  const production_envs = ["VITE_MODEL_NAME", "VITE_LOCAL_DRACO_PATH", "VITE_LOCAL_KTX_PATH", "VITE_BASE_URL", "VITE_TRACKING_URL"]

  // Only when production
  if ((mode === "production" && env.NODE_ENV === "production")) {
    const empty_envs = production_envs.filter(envVal => !env[envVal])
    if (empty_envs.length > 0) {
      throw new Error(`
        \n\n\n
        You missing key${empty_envs.length > 1 ? 's' : ''} in you .env.production file:
        ${empty_envs.map((key, i) => (i + 1) + '. ' + key).join('\n')}
        ----------------------------------------------------
        There are missing property from your environment variable.
        Here is what the value suppose to be inside file named '.env.production':
        VITE_MODEL_NAME=<Your-Project-Name>
        VITE_BASE_URL=https://domain.com/$VITE_MODEL_NAME
        VITE_LOCAL_DRACO_PATH=three/draco/javascript/
        # SEO URL for html attribute such as itemscope='http://example.com'
        # More info: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/itemscope
        VITE_TRACKING_URL=http://example.com/click
        VITE_LOCAL_KTX_PATH=examples/jsm/libs/basis/
        VITE_DEPLOY=true
        ----------------------------------------------------
        \n\n\n
      `)
    }
  }

  // Only when production
  if (mode === "production" && env.NODE_ENV === 'production') {
    console.clear()
    console.log('----------------------------------------------')
    console.log("Model Name:", env.VITE_MODEL_NAME)
    console.log("Model URL:", env.VITE_BASE_URL)
    console.log('----------------------------------------------')

    // For Bundle Aspect Ratio. Request User to key in inside terminal.
    if (env.VITE_DEPLOY && env.VITE_DEPLOY === 'true') {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const desktopRatioQuestion = await new Promise(resolve => rl.question(`Your bundle desktop ratio is "${desktopRatio}". Confirm? (y/n)\n> `, resolve))

      if (desktopRatioQuestion === 'n') {
        const desktopRatioAnswer = await new Promise(resolve => rl.question(`\n\nWrite your custom ratio in this format. Tips:\n- Replace '<width>' & '<height>' to your desired value\n- For more info: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio\n\nEx: <width> / <height>\n\n> `, resolve))

        desktopRatio = desktopRatioAnswer;
      }

      const mobileRatioQuestion = await new Promise(resolve => rl.question(`Your bundle mobile ratio is "${mobileRatio}". Confirm? (y/n)\n> `, resolve))

      if (mobileRatioQuestion === 'n') {
        const mobileRatioAnswer = await new Promise(resolve => rl.question(`\n\nWrite your custom ratio in this format Tips:\n- Replace '<width>' & '<height>' to your desired value\n- For more info: https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio\n\nEx: <width> / <height>\n\n> `, resolve))

        mobileRatio = mobileRatioAnswer;
      }

      rl.close()

    }
  }

  return {
    plugins: [react(), svgr(), tailwindcss(), glsl(), ((mode === 'production' || mode === 'preview') && env.NODE_ENV === 'production') && htmlPlugin(), (mode === 'production' && env.NODE_ENV === 'production') && cssInjectedByJsPlugin({
      preRenderCSSCode: (cssCode) => {
        // Replace font url from url('/fonts/ttf/3DSV2-BoldItalic.ttf') to url('http://domain.com/fonts/ttf/3DSV2-BoldItalic.ttf')
        if (cssCode.match(/url\(\s*(['"]?)(\/[^'")]+)\1\s*\)/gi)) {
          cssCode = cssCode.replace(/url\(\s*(['"]?)(\/[^'")]+)\1\s*\)/gi, env.VITE_BASE_URL + '/$2');
        }

        // Add Desktop Ratio & Mobile Ratio to Parent Container
        return cssCode + `div:has(bundle-3d-hotspots) {aspect-ratio: ${desktopRatio};}@media (max-width:480px) {div:has(bundle-3d-hotspots) {aspect-ratio: ${mobileRatio};}}`
      }
    })].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@three-math': path.resolve(dirname, './node_modules/three/src/math'),
        '@three-extras': path.resolve(dirname, './node_modules/three/examples/jsm')
      },
    },
    assetsInclude: ['public/**/*.glb', 'public/**/*.gltf'],
    build: {
      outDir: mode === "production" ? env.VITE_MODEL_NAME : env.NODE_ENV === "storybook" ? 'public' : "dist",
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) => {
            return `[name]-${randomHash()}.js`;
          }
        }
      },
      sourcemap: env.VITE_SOURCEMAP === 'true' ? true : false
    },
    preview: {
      port: env.VITE_BASE_URL && env.VITE_BASE_URL.match(/:(\d+)/) ? env.VITE_BASE_URL.match(/:(\d+)/)[1] : 4173
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