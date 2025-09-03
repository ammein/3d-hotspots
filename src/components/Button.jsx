import { Button as DassaultButton } from "@/design-system/components/buttons";

/**
 *
 * @param {import('@/design-system/components/buttons').Button} props
 * @returns
 */
const Button = ({ label = "button", ...props }) => {
  return (
    <DassaultButton type="button" aria-label={label} {...props}>
      {props.children}
    </DassaultButton>
  );
};

Button.PropsTypes;

export default Button;
