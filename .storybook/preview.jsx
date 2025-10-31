import '../src/stylesheets/theme.css';
import './font.css';
import { Title, Subtitle, Primary, Controls, Stories, Markdown, useOf, Story } from '@storybook/blocks';

/**
 * Get description from resolved of
 * @param {import('@storybook/blocks').DocsContextProps['resolveOf'] & { type: 'story' | 'meta' | 'component' }} resolvedOf
 * @returns
 * @link https://www.rhino-inquisitor.com/how-to-filter-jsdoc-in-storybook-autodocs/
 */
const getDescriptionFromResolvedOf = (resolvedOf) => {
  switch (resolvedOf.type) {
    case 'story': {
      return resolvedOf.story.parameters.docs?.description?.story || null;
    }
    case 'meta': {
      const { parameters, component } = resolvedOf.preparedMeta;
      const metaDescription = parameters.docs?.description?.component;
      if (metaDescription) {
        return metaDescription;
      }
      return (
        parameters.docs?.extractComponentDescription?.(component, {
          component,
          parameters,
        }) || null
      );
    }
    case 'component': {
      const {
        component,
        projectAnnotations: { parameters },
      } = resolvedOf;
      return (
        parameters.docs?.extractComponentDescription?.(component, {
          component,
          parameters,
        }) || null
      );
    }
    default: {
      throw new Error(`Unrecognized module type resolved from 'useOf', got: ${resolvedOf.type}`);
    }
  }
};

// eslint-disable-next-line react-refresh/only-export-components
const ModifiedDescription = (props) => {
  const { of } = props;

  if ('of' in props && of === undefined) {
    throw new Error('Unexpected `of={undefined}`, did you mistype a CSF file reference?');
  }
  const resolvedOf = useOf(of || 'meta');

  // if @param exists, only show description up to @param
  let description = getDescriptionFromResolvedOf(resolvedOf);

  if (description) {
    description = description.split('@param')[0];
    description = description.replace(/@type\s+[{].*[}]/g, '');
    description.trim();
  }

  return <Markdown>{description}</Markdown>;
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <ModifiedDescription />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
  },
};

export default preview;
