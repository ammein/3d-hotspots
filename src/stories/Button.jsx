import PropTypes from 'prop-types';
import DassaultButton from '../components/Button'
import PlaySVG from '@/design-system/icons/play-big.svg?react'
import RightArrow from '@/design-system/icons/down-chevron-big.svg?react'

/** Primary UI component for user interaction */
export const Button = ({
  buttonType = "scream",
  size = 'large',
  label,
  ...props
}) => {
  let render;
  switch(true) {
  case buttonType === "circle":
      render = <PlaySVG style={{
      color: "blue"
      }}/>
      break;

  case (buttonType === "cheer" || buttonType === "murmur"):
      render = (
      <>
          <RightArrow style={{
          transform: 'rotate(-90deg)'
          }} />
          {label}
      </>
      )
      break;

  default:
      render = label
  }

  return <DassaultButton label={label} buttonType={buttonType} size={size} {...props}>{render}</DassaultButton>
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
  /** Optional click handler */
  onClick: PropTypes.func,
};
