import tw from 'tailwind-styled-components';
import styled from 'styled-components';

const headingStyle = styled.h1`
  font-size: ${(props) =>
    props.type === 'h1' ? '55px' : props.type === 'h2' ? '44px' : props.type === 'h3' ? '32px' : '26px'};
  line-height: ${(props) =>
    props.type === 'h1' ? '64px' : props.type === 'h2' ? '48px' : props.type === 'h3' ? '40px' : '32px'};
  word-wrap: break-word;
  letter-spacing: ${(props) =>
    props.type === 'h1' ? '-1.3px' : props.type === 'h2' ? '-1px' : props.type === 'h3' ? '-0.8px' : '-0.6px'};

  @media only screen and (min-width: 768px) and (max-width: 1599px) {
    font-size: ${(props) =>
      props.type === 'h1' ? '44px' : props.type === 'h2' ? '32px' : props.type === 'h3' ? '26px' : '22px'};
    line-height: ${(props) =>
      props.type === 'h1' ? '48px' : props.type === 'h2' ? '36px' : props.type === 'h3' ? '32px' : '28px'};
    letter-spacing: ${(props) =>
      props.type === 'h1' ? '-1px' : props.type === 'h2' ? '-0.8px' : props.type === 'h3' ? '-0.6px' : '-0.5px'};
  }

  @media only screen and (min-width: 767px) {
    font-size: ${(props) =>
      props.type === 'h1' ? '32px' : props.type === 'h2' ? '26px' : props.type === 'h3' ? '22px' : '18px'};
    line-height: ${(props) =>
      props.type === 'h1' ? '36px' : props.type === 'h2' ? '32px' : props.type === 'h3' ? '28px' : '28px'};
    letter-spacing: ${(props) =>
      props.type === 'h1' ? '-0.8px' : props.type === 'h2' ? ' -0.6px' : props.type === 'h3' ? '-0.4px' : ' -0.2px'};
  }
`;

const paragraphStyle = styled.p`
  font-size: ${(props) => (props.type === 'body' ? '16px' : '13px')};
  line-height: ${(props) => (props.type === 'body' ? '24px' : '20px')};
  word-wrap: break-word;
  letter-spacing: ${(props) => (props.type === 'body' ? '-0.2px' : '0px')};
`;

const paragraphFont = (props) => {
  switch (props.type) {
    case 'body':
      return props.fontStyle === 'italic' ? 'font-italic' : 'font-regular';

    case 'caption':
      return props.fontStyle === 'italic' ? 'font-light-italic' : 'font-light';
  }
};

/**
 * @typedef {{
 * color: string
 * weight: 'semibold' | 'bold'
 * type: 'h1' | 'h2' | 'h3' | 'h4'
 * }} HeadingParams
 */

/**
 * @type {import('tailwind-styled-components/dist/tailwind').TailwindComponent<'web' , HeadingParams & import('react').HTMLProps<HTMLHeadingElement>}
 */
export const Heading = tw(headingStyle)`${(props) => (props.$weight === 'semibold' ? 'font-semibold' : 'font-bold')} ${(
  props
) => props.color}`;

/**
 * @typedef {{
 *      color: string
 *      fontStyle: 'italic' | 'regular'
 *      type: 'body' | 'caption'
 * }} BodyParams
 */

/**
 * @type {import('tailwind-styled-components/dist/tailwind').TailwindComponent<'web', BodyParams & React.HTMLAttributes<HTMLHeadingElement>>}
 */
export const Paragraph = tw(paragraphStyle)`
    ${(props) => paragraphFont(props)} ${(props) => props.color}
`;
