import Heading from '@/design-system/atoms/Heading';

/**
 * Headline Component
 * @param {import('@/design-system/atoms/typography').HeadingParams & import('react').HTMLProps<HTMLHeadingElement>} param0
 * @returns
 */
export const Headline = ({ type = 'h1', weight, color, ref, ...props }) => {
  // 3. Render the selected component
  return <Heading ref={ref} weight={weight} color={color} type={type} {...props} />;
};

Headline.displayName = 'Headline';

export default Headline;
