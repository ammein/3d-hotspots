import { Paragraph } from '@/design-system/atoms/typography';

/**
 * Body Paragraph Component
 * @typedef ButtonProps
 * @property {string} label Aria Label of a button
 *
 * @param {import('@/design-system/atoms/typography').BodyParams & import('react').HTMLAttributes<HTMLHeadingElement>} props
 * @returns
 */
export const Body = ({ type = 'body', color, fontStyle, ...props }) => {
  // 3. Render the selected component
  return (
    <Paragraph
      as={type !== 'body' && 'span'}
      fontStyle={fontStyle}
      color={color}
      type={type}
      {...props}
    />
  );
};

Body.displayName = 'Body';

export default Body;
