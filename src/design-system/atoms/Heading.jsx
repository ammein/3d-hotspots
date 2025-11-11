import styles from '@/stylesheets/modules/Heading.module.css';

/**
 * @typedef {Object} Heading
 * @property {"semibold" | "bold"} weight
 * @property {string} color - Tailwindcss color
 * @property {"h1" | "h2" | "h3" | "h4"} type
 * @property {string} className
 * @property {import('react').PropsWithChildren<HTMLHeadingElement>} rest
 */

/**
 * Heading Design System
 * @param {Heading} 0
 * @returns
 */
const Heading = ({ weight = 'semibold', color = '', type = 'h1', className = '', ...rest }) => {
  const Tag = type || 'h1';
  const typeClass = styles[type] || styles.h1;

  const { children } = rest;

  // Map weight to font family helper class from CSS Module.
  // We keep font-weight visual via Tailwind utilities too (font-semibold / font-bold).
  const fontFamilyClass = weight === 'semibold' ? styles['font-semibold'] : styles['font-bold'];
  const fontWeightTailwind = weight === 'semibold' ? 'font-semibold' : 'font-bold';

  // color can be a Tailwind class (e.g., 'text-red-500') or a class that resolves to a CSS variable.
  // If not provided, use defaultVisual defined in the module.
  const colorClass = color || styles.defaultVisual;

  return (
    <Tag
      className={`${styles.heading} ${typeClass} ${fontFamilyClass} ${fontWeightTailwind} ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Heading;
