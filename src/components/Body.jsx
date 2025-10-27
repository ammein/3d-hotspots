import Paragraph from '@/design-system/atoms/Paragraph';

/**
 * Body Paragraph Component
 * @typedef ButtonProps
 * @property {string} label Aria Label of a button
 *
 * @param {import('@/design-system/atoms/Paragraph').Paragraph & import('react').HTMLAttributes<HTMLHeadingElement>} props
 * @returns
 */
export const Body = ({ type = 'body', color, weight, ...props }) => {
  // 3. Render the selected component
  return <Paragraph weight={weight} color={color} type={type} {...props} />;
};

Body.displayName = 'Body';

export default Body;
