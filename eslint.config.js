// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'public',
    'storybook',
    'dist-preview',
    'scripts',
    'storybook-static',
    'src/glsl',
    'src/assets',
    'vite.config.js',
    'torchlight.config.js'
  ]),
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'storybook': storybook
    },
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      'react-hooks/exhaustive-deps': 'warn' // Checks effect dependencies
    },
  },
])
