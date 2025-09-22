import { Button as DassaultButton } from '@/design-system/components/buttons';

/**
 * Dassault Systemes Button Component
 * @typedef ButtonProps
 * @property {string} label Aria Label of a button
 *
 * @param {import('@/design-system/components/buttons').Button & import('react').HTMLAttributes<HTMLButtonElement> & ButtonProps} rest
 * @returns
 */
const Button = ({ label = 'button', ...rest }) => {
  return (
    <DassaultButton type="button" aria-label={label} {...rest}>
      {rest.children}
    </DassaultButton>
  );
};

Button.displayName = 'Button';

export default Button;
