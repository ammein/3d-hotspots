import { Fog } from './Fog'

/**
 * @type {import('@storybook/react-vite').Meta<typeof Fog>}
 */
export default {
  title: "GLSL/Fog",
  component: Fog,
  tags: ['autodocs']
}

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Foggy = {
  args: {
    cameraPos: [0, 0, 20],
    focalRange: 18.0,
    fogColor: '#ffffff',
    intensity: 0.5,
    shadowMap: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Foggy'
      }
    }
  }
}

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const FoggyClear = {
  args: {
    cameraPos: [0, 0, 20],
    focalRange: 100.,
    fogColor: '#ffffff',
    intensity: 0.5,
    shadowMap: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Clear'
      }
    }
  }
}