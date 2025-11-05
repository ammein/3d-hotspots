import postcss from 'postcss';

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "staticDirs": ['../public'],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    '@storybook/addon-links',
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    {
      "name": '@storybook/addon-postcss',
      "options": {
        "cssLoaderOptions": {
          // When you have splitted your css over multiple files
          // and use @import('./other-styles.css')
          "importLoaders": 1,
        },
        "postcssLoaderOptions": {
          // When using postCSS 8
          "implementation": postcss,
        },
      },
    },
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  // Twin recommends adding the babel config here as Next.js disables SWC when .babelrc is added to the root.
  babel: async options => {
    return {
      ...options,
      plugins: [
        ...options.plugins,
        'babel-plugin-twin',
        'babel-plugin-macros',
        'babel-plugin-styled-components'
      ],
    }
  },
};
export default config;