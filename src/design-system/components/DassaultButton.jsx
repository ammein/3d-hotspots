import styles from '@/stylesheets/modules/Button.module.css';

/**
 * @typedef {{
 * size: "large" | "regular" | "small";
 * icon: boolean;
 * buttonType: "scream" | "shout" | "cheer" | "murmur" | "circle";
 * greyButton: boolean;
 * weight: "regular" | "italic" | "semibold" | "semibold-italic" | "bold" | "bold-italic";
 * other: string
 * }} Button
 */

/**
 * Dassault Button
 * @param {Button} props
 * @returns
 */
const Button = (props) => {
  const {
    size = 'regular',
    icon = false,
    buttonType = 'scream',
    greyButton = false,
    weight = 'regular',
    other = '',
    disabled = false,
    noHover = false,
    className = '',
    children,
    ...rest
  } = props;

  const classes = [styles.base];

  if (!disabled) classes.push(styles.cursorPointer);

  // allow passing raw utility classes via other or className
  if (other) classes.push(other);
  if (className) classes.push(className);

  // Button type styles
  switch (buttonType) {
    case 'scream':
      if (greyButton) {
        classes.push(styles.screamGrey, styles.outline1, styles.outlineBlack64);
      } else {
        classes.push(styles.scream, (!disabled || !noHover) && styles['scream-enabledHover']);
      }
      break;

    case 'shout':
      if (greyButton) {
        classes.push(styles.shoutGrey);
      } else {
        classes.push(styles.shout, (!disabled || !noHover) && styles['shout-enabledHover']);
      }
      break;

    case 'cheer':
      classes.push(styles.cheer);
      break;

    case 'murmur':
      classes.push(styles.murmur);
      break;

    case 'circle':
      classes.push(styles.circle, styles.circleShadow);
      break;

    default:
      throw new Error("You forgot to insert param named: 'buttonType'");
  }

  // Sizing logic (applies the exact sizes from your original)
  if (buttonType === 'circle') {
    if (size === 'large' || size === 'regular') {
      classes.push(styles.circleLarge);
    } else {
      classes.push(styles.circleSmall);
    }
  } else if (buttonType === 'scream' || buttonType === 'shout') {
    if (icon) {
      if (size === 'large') classes.push(styles.sizeIconLarge);
      else if (size === 'regular') classes.push(styles.sizeIconRegular);
      else classes.push(styles.sizeIconSmall);
    } else {
      // text-only variants
      if (size === 'large') classes.push(styles.sizeTextLarge);
      else if (size === 'regular') classes.push(styles.sizeTextRegular);
      else classes.push(styles.sizeTextSmall);
      // gap/justify/items already included in sizeText* helpers
    }
  }

  // Weight
  switch (weight) {
    case 'regular':
      classes.push(styles.weightRegular);
      break;
    case 'italic':
      classes.push(styles.weightItalic);
      break;
    case 'semibold':
      classes.push(styles.weightSemibold);
      break;
    case 'semibold-italic':
      classes.push(styles.weightSemiboldItalic);
      break;
    case 'bold':
      classes.push(styles.weightBold);
      break;
    case 'bold-italic':
      classes.push(styles.weightBoldItalic);
      break;
    default:
      classes.push(styles.weightRegular);
  }

  // Text size
  if (size === 'large') classes.push(styles.textLarge);
  else if (size === 'regular') classes.push(styles.textRegular);
  else classes.push(styles.textSmall);

  const finalClassName = classes.filter(Boolean).join(' ');

  // Do not forward  props to DOM
  return (
    <button className={finalClassName} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
