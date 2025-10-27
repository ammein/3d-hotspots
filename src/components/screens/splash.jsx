import Headline from '@/components/Headline';
import { Paragraph } from '@/stories/Paragraph';
import Button from '@/components/Button';
import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useTranslations } from 'use-intl';
import SplashCSS from '@/stylesheets/modules/Splash.module.css';
import HeadlineCSS from '@/stylesheets/modules/Headline.module.css';
import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import { useApp } from '../context/AppManagement';

/**
 * Splash Container
 * @param {import('@/components/hoc/TheatreManagement').TheatreReturnValue & { callback: Function, loaded: boolean, start: boolean }} param0
 * @returns
 */
function Splash({ callback, loaded, start, ...rest }) {
  const t = useTranslations('Splash');
  const [visibility, setVisibility] = useState(false);
  const headline = useRef();
  const container = useRef();
  const paragraph = useRef();
  const SplashStyles = [];

  const { appProject, metadata } = useApp();

  const { Splash: SplashTheatreJS } = rest.theatre;

  if (loaded && !start && !visibility) {
    setVisibility(true);
  } else if (loaded && start && visibility) {
    setVisibility(false);
  }

  const buttonClick = useCallback(() => {
    callback('start');
  }, [callback]);

  useLayoutEffect(() => {
    if (loaded) {
      callback('loaded');
    }
  }, [callback, loaded]);

  SplashStyles.push(SplashCSS.Splash);

  if (visibility) {
    SplashStyles.push(SplashCSS['Splash-Display'], 'animate-blur-appear');
  }

  const SplashFinalClasses = SplashStyles.filter(Boolean).join(' ');

  return (
    SplashTheatreJS && (
      <div className={SplashCSS.Container}>
        <div
          className={SplashFinalClasses}
          style={{
            backdropFilter: `blur(${SplashTheatreJS.backdrop.blur}px) opacity(${
              SplashTheatreJS.backdrop.backgroundOpacity * 100
            }%)`,
          }}
          ref={container}
        >
          <Headline
            ref={headline}
            weight={SplashTheatreJS.title.weight}
            type={SplashTheatreJS.title.type}
            color={HeadlineCSS.Headline}
          >
            {t('title')}
          </Headline>
          <Paragraph ref={paragraph}>{t('description')}</Paragraph>
          <Button
            buttonType="scream"
            size="large"
            weight="bold"
            label={t('button')}
            seo={t('seo')}
            metadata={metadata}
            onClick={buttonClick}
            other={SplashCSS.SplashButton}
          >
            {t('button')}
          </Button>
        </div>
        {SplashTheatreJS.image && SplashTheatreJS.image.id.length > 0 && (
          <img
            src={appProject.getAssetUrl(SplashTheatreJS.image)}
            alt="Thumbnail"
            className={(visibility ? 'animate-blur-appear' : 'animate-blur-dissappear') + ' ' + SplashCSS.Thumbnail}
          />
        )}
      </div>
    )
  );
}

const SplashTheatreJS = withTheatreManagement(Splash, 'Scene / Splash', {
  Splash: {
    props: {
      backdrop: types.compound({
        backgroundOpacity: types.number(1, {
          range: [0, 1],
          label: 'opacity',
          nudgeMultiplier: 0.01,
        }),
        blur: types.number(5, {
          range: [0, 1000],
          nudgeMultiplier: 1,
        }),
      }),
      title: types.compound({
        type: types.stringLiteral('h1', {
          h1: 'Heading 1',
          h2: 'Heading 2',
          h3: 'Heading 3',
          h4: 'Heading 4',
        }),
        weight: types.stringLiteral('bold', {
          bold: 'Bold',
          semibold: 'SemiBold',
        }),
      }),
      image: types.image('', {
        label: 'Splash Image',
      }),
    },
    options: {
      reconfigure: true,
    },
  },
  r3f: false,
});

export default SplashTheatreJS;
