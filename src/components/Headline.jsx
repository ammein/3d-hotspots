import { Heading } from "@/design-system/atoms/typography";

/**
 * Headline Component
 * @param {import('react').ComponentProps<import('@/design-system/atoms/typography').HeadingParams | & React.HTMLAttributes<HTMLHeadingElement>>} param0
 * @returns
 */
export const Headline = ({ type = "h1", weight, color, ...props }) => {
  // 3. Render the selected component
  return (
    <Heading
      as={type !== "h1" && type}
      weight={weight}
      color={color}
      type={type}
      {...props}
    />
  );
};

Headline.displayName = "Headline";

export default Headline;
