import { expect, fn } from 'storybook/test';

import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
/**
 * @type {import('@storybook/react-vite').Meta<typeof Button>}
 */
export default {
  title: 'Dassault Systemes/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      description: {
        component: 'This is Button component that uses Dassault Systemes Branding'
      }
    }
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Scream = {
  args: {
    buttonType: "scream",
    size: "regular",
    label: 'Button',
    onClick: fn()
  },
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await userEvent.hover(canvas.getByRole('button', { name: 'Button' }))

    await expect(args.onClick).toHaveBeenCalled()
  }
};

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Shout = {
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  args: {
    buttonType: "shout",
    size: "regular",
    label: "Button",
    onClick: fn()
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await userEvent.hover(canvas.getByRole('button', { name: 'Button' }))

    await expect(args.onClick).toHaveBeenCalled()
  }
}

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Cheer = {
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  args: {
    buttonType: "cheer",
    size: "regular",
    label: "Button",
    onClick: fn()
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await userEvent.hover(canvas.getByRole('button', { name: 'Button' }))

    await expect(args.onClick).toHaveBeenCalled()
  }
}

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Murmur = {
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  args: {
    buttonType: "murmur",
    size: "regular",
    label: "Button",
    onClick: fn()
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await userEvent.hover(canvas.getByRole('button', { name: 'Button' }))

    await expect(args.onClick).toHaveBeenCalled()
  }
}

/**
 * @type {import('@storybook/react-vite').StoryObj}
 */
export const Circle = {
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  args: {
    buttonType: "circle",
    size: "regular",
    label: "Play",
    onClick: fn()
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Play' }))
    await userEvent.hover(canvas.getByRole('button', { name: 'Play' }))

    await expect(args.onClick).toHaveBeenCalled()
  }
}