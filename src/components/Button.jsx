import DassaultButton from '@/design-system/components/DassaultButton';
import { convertCase } from '@/helpers/utils';

/**
 * Dassault Systemes Button Component
 * @typedef ButtonProps
 * @property {string} label Aria Label of a button
 * @property {string} seo SEO for ItemProp 'label'
 * @property {Object} metadata Metadata from metadata.json
 */

/**
 * Button Component
 * @param {import('@/design-system/components/DassaultButton).Button & import('react').HTMLAttributes<HTMLButtonElement> & ButtonProps} rest
 * @returns
 */
const Button = ({ label = 'button', seo = '', metadata = {}, ...rest }) => {
  return (
    <DassaultButton
      type="button"
      aria-label={label}
      itemScope={import.meta.env.PROD ? true : undefined}
      itemType={import.meta.env.PROD ? import.meta.env.VITE_TRACKING_URL : undefined}
      {...rest}
    >
      {import.meta.env.PROD && Object.values(metadata).length > 0 && (
        <>
          {/* https://react.dev/reference/react-dom/components/meta#annotating-specific-items-within-the-document-with-metadata */}
          <meta itemProp="category" content={metadata.tracking.category} />
          <meta itemProp="action" content={metadata.tracking.action} />
          <meta itemProp="label" content={convertCase(seo, 'snake')} />
        </>
      )}
      {rest.children}
    </DassaultButton>
  );
};

Button.displayName = 'Button';

/**
 * @returns {import('@/design-system/components/DassaultButton').Button & import('react').HTMLAttributes<HTMLButtonElement> & ButtonProps}
 */
export default Button;
