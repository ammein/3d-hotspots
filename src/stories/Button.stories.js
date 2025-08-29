import { fn } from 'storybook/test';

import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Dassault Systemes/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Scream = {
  args: {
    buttonType: "scream",
    size: "regular",
    label: 'Button',
  },
};

export const Shout = {
  args: {
    buttonType: "shout",
    size: "regular",
    label: "button"
  }
}

export const Cheer = {
  args: {
    buttonType: "cheer",
    size: "regular",
    label: "button"
  }
}

export const Murmur = {
  args: {
    buttonType: "murmur",
    size: "regular",
    label: "button"
  }
}

export const Circle = {
  args: {
    buttonType: "circle",
    size: "regular",
    label: "Play"
  }
}