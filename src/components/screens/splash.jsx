import styled from 'styled-components';
import tw from 'tailwind-styled-components';
import Headline from '@/components/Headline';
import { Paragraph } from '@/stories/Paragraph';
import Button from '@/components/Button';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'use-intl';

const SplashStyles = styled.div`
  height: auto;
`;

const SplashContainer = tw(SplashStyles)`${({ $show = false }) =>
  $show ? 'inline-flex animate-blur-appear' : 'hidden'} will-change-transform
        absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex-col justify-center items-center gap-8
				bg-white-32
				bg-blend-color-burn bg-white backdrop-blur-[5px]
				pt-[20px] pb-[20px]`;

function Splash({ callback, loaded }) {
  const t = useTranslations('Splash');
  const [visibility, setVisibility] = useState(false);
  const headline = useRef();
  const container = useRef();
  const paragraph = useRef();

  const buttonClick = useCallback((e) => {
    callback('start');
    setVisibility(false);
  });

  useEffect(() => {
    if (loaded) {
      callback('loaded');
      setVisibility(true);
    }
  }, [loaded]);

  return (
    <SplashContainer ref={container} $show={visibility}>
      <Headline ref={headline} type="h1" color={/* tailwindcss */ 'text-corporateblue'}>
        {t('title')}
      </Headline>
      <Paragraph ref={paragraph}>{t('description')}</Paragraph>
      <Button $buttonType="scream" $size="large" $weight="bold" onClick={buttonClick}>
        {t('button')}
      </Button>
    </SplashContainer>
  );
}

export default Splash;
