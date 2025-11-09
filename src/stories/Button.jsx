import PropTypes from 'prop-types';
import DassaultButton from '@/components/Button';
import ButtonStyles from '@/stylesheets/modules/Button.module.css';
import PlaySVG from '@/design-system/icons/play-big.svg?react';
import RightArrow from '@/design-system/icons/down-chevron-big.svg?react';

/** Primary UI component for user interaction */
export const Button = ({ buttonType = 'scream', size = 'large', label, weight = 'bold', ...props }) => {
  let render;
  switch (true) {
    case buttonType === 'circle':
      render = (
        <PlaySVG
          width={16}
          height={16}
          style={{
            color: 'blue',
          }}
        />
      );
      break;

    case buttonType === 'cheer' || buttonType === 'murmur':
      render = (
        <div className="text-s flex gap-2 flex-row align-middle items-center">
          <div
            className={`${ButtonStyles.iconContainerBig} ${
              buttonType === 'cheer' ? ButtonStyles.cheerIconContainer : ''
            }`}
          >
            <RightArrow
              width={16}
              height={16}
              style={{
                transform: 'rotate(-90deg)',
              }}
            />
          </div>
          {label}
        </div>
      );
      break;

    default:
      render = label;
  }

  return (
    <DassaultButton label={label} weight={weight} buttonType={buttonType} size={size} {...props}>
      {render}
    </DassaultButton>
  );
};

Button.propTypes = {
  /** Button Type */
  buttonType: PropTypes.oneOf(['scream', 'shout', 'cheer', 'murmur', 'circle']),
  /** How large should the button be? */
  size: PropTypes.oneOf(['small', 'regular', 'large']),
  /** Enable/Disable grey button */
  greyButton: PropTypes.bool,
  /** Button contents */
  label: PropTypes.string.isRequired,
  /** Font Weight */
  weight: PropTypes.oneOf(['regular', 'italic', 'semibold', 'semibold-italic', 'bold', 'bold-italic']),
  /** Optional click handler */
  onClick: PropTypes.func,
};
