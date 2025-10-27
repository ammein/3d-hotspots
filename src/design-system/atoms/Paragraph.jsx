import styles from '@/stylesheets/modules/Paragraph.module.css';

/**
 * @typedef {Object} Paragraph
 * @property {"regular" | "italic"} weight
 * @property {string} color - Tailwindcss color
 * @property {"body" | "p"} type
 * @property {string} className
 * @property {import('react').PropsWithChildren<HTMLParagraphElement>} rest
 */

/**
 * Paragraph Atom
 * @param {Paragraph} param0
 * @returns
 */
const Paragraph = ({ color = '', weight = 'regular', type = 'body', className = '', ...rest }) => {
  const { children } = rest;
  const Tag = 'p';
  const typeClass = styles[type] || styles.body;

  // Map fontStyle to module helper
  const fontClass = weight === 'italic' ? styles['font-italic'] || '' : styles['font-regular'] || '';

  const colorClass = color || styles.defaultVisual;

  return (
    <Tag className={`${styles.paragraph} ${typeClass} ${fontClass} ${colorClass} ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

/**
 * @returns {Paragraph}
 */
export default Paragraph;
