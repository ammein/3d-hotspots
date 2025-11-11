/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'
import glsl from 'vite-plugin-glsl'
import tailwindcss from '@tailwindcss/vite';
import { randomHash } from './src/helpers/utils';
import beautify from 'js-beautify';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import mdxMermaid from 'mdx-mermaid'
import { Mermaid } from 'mdx-mermaid/lib/Mermaid'

// https://vite.dev/config/
import path from 'node:path';
import { URL } from 'node:url'
import fs from 'node:fs'
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

/**
 * Custom Log for Dassault Systems for Maintainer to copy and paste to server admin
 * @param {string} mode 
 * @param {object} env 
 * @returns 
 */
function logFinalIndex(mode, env, dist) {
  return {
    name: 'log-final-index',
    closeBundle() {
      if ((mode === 'production' || env.NODE_ENV === 'production') && !env.NODE_ENV === 'storybook') {
        console.clear()

        try {
          const outDir = dist;
          const files = fs.readdirSync(outDir);
          const indexFile = files.find(f => /^index-[^.]+\.js$/.test(f));
          if (!indexFile) {
            console.warn('No index-*.js found in', outDir);
            return;
          }

          const filePath = path.join(process.cwd(), outDir, indexFile);
          const HTMLPath = path.join(process.cwd(), outDir, 'index.html');
          if (fs.existsSync(filePath) && fs.existsSync(HTMLPath)) {
            const bundleTag = /<(?<tag>bundle[^\s/>]*)\b[^>]*>([\s\S]*?)<\/\k<tag>>/i;
            const content = fs.readFileSync(HTMLPath, 'utf-8');
            const html = content.match(bundleTag);
            const bundleName = html.groups.tag;
            console.log('----------------------------------------------')
            console.log("Model Name:", env.VITE_MODEL_NAME)
            console.log("Model URL:", env.VITE_BASE_URL + "/" + indexFile)
            console.log("Bundle Name:", bundleName)
            console.log('----------------------------------------------')
          } else {
            console.warn("Unable to find html bundle in index.html")
            console.log('----------------------------------------------')
            console.log("Model Name:", env.VITE_MODEL_NAME)
            console.log("Model URL:", env.VITE_BASE_URL)
            console.log('----------------------------------------------')
          }
        } catch (err) {
          console.error('[log-final-index] Error reading file:', err);
        }
      }
    }
  };
}

/**
 * URL Resolve that continue after pathname.
 * @param {string} base 
 * @param {string} rel 
 * @example
 * // Example:
 * resolveInsideBase('https://www.domain.com/assets/second-path', '/fonts/ttf/3DSV2-Bold.ttf');
 * // => 'https://www.domain.com/assets/second-path/fonts/ttf/3DSV2-Bold.ttf'
 * @returns 
 */
function resolveInsideBase(base, rel) {
  const baseUrl = new URL(base.endsWith('/') ? base : base + '/');
  const r = rel.startsWith('/') ? rel.slice(1) : rel;
  return new URL(r, baseUrl).toString();
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
/**
 * @author Amin Shazrin https://github.com/ammein
 */
export default defineConfig(async ({ mode }) => {
  // Insert all environment variables into `env`
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // Final Destination folder
  const finalDist = mode === "production" ? env.VITE_MODEL_NAME : env.NODE_ENV === "storybook" ? 'public' : "dist"

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
        # Model Name
        VITE_MODEL_NAME=<your-model-name>
        # Model URL
        VITE_BASE_URL=https://production-domain.com/$VITE_MODEL_NAME
        # SEO itemtype='http://tracking.domain.com/'
        # More info: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/itemscope
        VITE_TRACKING_URL=http://tracking.domain.com/
        # DRACO path in public folder after run 'yarn draco'
        VITE_LOCAL_DRACO_PATH=three/draco/javascript/
        # Basis path in public folder after run 'yarn basis'
        VITE_LOCAL_KTX_PATH=examples/jsm/libs/basis/
        # To disable sourcemap in production
        VITE_SOURCEMAP=false
        # IMPORTANT for Interactive Asset export.
        # (This will enable all files in one single Javascript module file so that it can be played in 3DS Webpage)
        VITE_DEPLOY=true
        ----------------------------------------------------
        \n\n\n
      `)
    }
  }

  // Only when production
  if (mode === "production" && env.NODE_ENV === 'production') {
    console.clear()

    // For Bundle Aspect Ratio. Request User to key in inside terminal.
    if (env.VITE_DEPLOY && env.VITE_DEPLOY === 'true') {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const desktopRatioQuestion = await new Promise(resolve => rl.question(`Your bundle desktop ratio is "${desktopRatio}". Confirm? (y/n)\n> `, resolve))

      if (desktopRatioQuestion === 'n') {
        const desktopRatioAnswer = await new Promise(resolve => rl.question(`\n\nWrite your custom ratio in this format. Tips:\n- Replace '<width>' & '<height>' to your desired value\n- For more info: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio\n\nEx: <width> / <height>\n\n> `, resolve))

        desktopRatio = desktopRatioAnswer;
      }

      const mobileRatioQuestion = await new Promise(resolve => rl.question(`Your bundle mobile ratio is "${mobileRatio}". Confirm? (y/n)\n> `, resolve))

      if (mobileRatioQuestion === 'n') {
        const mobileRatioAnswer = await new Promise(resolve => rl.question(`\n\nWrite your custom ratio in this format Tips:\n- Replace '<width>' & '<height>' to your desired value\n- For more info: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio\n\nEx: <width> / <height>\n\n> `, resolve))

        mobileRatio = mobileRatioAnswer;
      }

      rl.close()

    }
  }

  return {
    plugins: [react(), svgr(), tailwindcss(), glsl(), ((mode === 'production' || mode === 'preview') && env.NODE_ENV === 'production') && htmlPlugin(), logFinalIndex(mode, env, finalDist), (mode === 'production' && env.NODE_ENV === 'production') && cssInjectedByJsPlugin({
      preRenderCSSCode: (cssCode) => {
        // Replace font url from url('/fonts/ttf/3DSV2-BoldItalic.ttf') to url('http://domain.com/fonts/ttf/3DSV2-BoldItalic.ttf')
        for (const match of cssCode.matchAll(/url\(\s*(['"]?)(\/[^'")]+)\1\s*\)/gi)) {
          cssCode = cssCode.replace(match[0], "url(" + resolveInsideBase(env.VITE_BASE_URL, match[2]) + ")")
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
      outDir: finalDist,
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
          }),
          // https://www.npmjs.com/package/mdx-mermaid
          {
            remarkPlugins: [[mdxMermaid.default, { output: 'svg' }]],
            components: { mermaid: Mermaid, Mermaid }
          }
        ],
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