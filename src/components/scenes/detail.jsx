import withTheatreManagement from '../hoc/TheatreManagement';
import CloseIcon from '@/design-system/icons/close-big.svg?react';
import HotspotCSS from '@/stylesheets/modules/Hotspot.module.css';
import { Html } from '@react-three/drei';
import Button from '@/components/Button';
import { useApp } from '@/components/context/AppManagement';
import { useTranslations } from 'use-intl';
import { types } from '@theatre/core';

/**
 * @typedef {Object} Detail
 * @property {string} hostpotName
 * @property {boolean} hidden
 * @property {Function} onClose
 * @property {string} link
 */

/**
 * Hotspot Line component
 * @param { Detail & import('@/components/hoc/TheatreManagement').TheatreReturnValue } 0
 * @returns
 */
const Detail = ({ hotspotName, hidden, onClose, link, ...props }) => {
  const { metadata } = useApp();

  const t = useTranslations(`Hotspots.${hotspotName}`);

  const {
    Content: ContentTheatreJS,
    'CTA Button': ButtonTheatreJS,
    'Close Button': CloseButtonTheatreJS,
  } = props.theatre;

  return (
    ContentTheatreJS &&
    ButtonTheatreJS &&
    CloseButtonTheatreJS &&
    !hidden && (
      <Html
        as="div"
        style={{
          padding: `${ContentTheatreJS.padding.top}px ${ContentTheatreJS.padding.right}px ${ContentTheatreJS.padding.bottom}px ${ContentTheatreJS.padding.left}px`,
          display: hidden ? 'none' : 'flex',
          backgroundColor: `rgba(${ContentTheatreJS.color.r * 255}, ${ContentTheatreJS.color.g * 255}, ${
            ContentTheatreJS.color.b * 255
          }, ${ContentTheatreJS.color.a})`,
          flexDirection: 'column',
          backdropFilter: `blur(${ContentTheatreJS.blur}px)`,
          gap: `${ContentTheatreJS.gap}px`,
          borderRadius: `${ContentTheatreJS.radius}%`,
          width: '328px',
        }}
      >
        <Button
          icon
          buttonType="circle"
          size={CloseButtonTheatreJS.size}
          label="Close Button"
          seo="Close Hotspot"
          metadata={metadata}
          other={HotspotCSS.HotspotButton}
          style={{
            top: `${CloseButtonTheatreJS.position.top}%`,
            left: `${CloseButtonTheatreJS.position.left}%`,
          }}
          onClick={onClose}
        >
          <CloseIcon width={16} height={16} />
        </Button>
        <p>{t('description')}</p>
        {link && (
          <a href={link}>
            <Button
              buttonType={ButtonTheatreJS.type}
              size={ButtonTheatreJS.size}
              weight={ButtonTheatreJS.font}
              metadata={metadata}
              label={t('button')}
              seo={t('seo')}
            >
              {t('button')}
            </Button>
          </a>
        )}
      </Html>
    )
  );
};

const DetailTheatreJS = withTheatreManagement(Detail, 'Scene / Detail', {
  Content: {
    props: {
      color: types.rgba({
        r: 1,
        g: 1,
        b: 1,
        a: 0.4,
      }),
      blur: types.number(22, {
        nudgeMultiplier: 1,
      }),
      padding: types.compound({
        top: types.number(5),
        right: types.number(5),
        bottom: types.number(5),
        left: types.number(0),
      }),
      gap: types.number(22, {
        nudgeMultiplier: 0.5,
      }),
      radius: types.number(0, {
        range: [0, 100],
      }),
    },
    options: {
      reconfigure: true,
    },
  },
  'CTA Button': {
    props: {
      type: types.stringLiteral('scream', {
        scream: 'Scream',
        shout: 'Shout',
        cheer: 'cheer',
        murmur: 'Murmur',
        circle: 'Circle',
      }),
      size: types.stringLiteral('large', {
        large: 'Large',
        regular: 'Regular',
        small: 'Small',
      }),
      font: types.stringLiteral('bold', {
        bold: 'Bold',
        'bold-italic': 'Bold Italic',
        semibold: 'SemiBold',
        'semibold-italic': 'Semibold Italic',
        regular: 'Regular',
        italic: 'Italic',
      }),
    },
    options: {
      reconfigure: true,
    },
  },
  'Close Button': {
    props: {
      position: types.compound({
        top: types.number(-9, {
          range: [-100, 100],
          label: 'Top - Bottom',
        }),
        left: types.number(-17, {
          range: [-100, 100],
          label: 'Left - Right',
        }),
      }),
      size: types.stringLiteral('small', {
        small: 'Small',
        regular: 'Regular',
      }),
    },
    options: {
      reconfigure: true,
    },
  },
});

export default DetailTheatreJS;
