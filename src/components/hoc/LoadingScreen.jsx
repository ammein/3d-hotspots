import { useEffect, useRef, useState } from 'react';
import useFontFaceObserver from 'use-font-face-observer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Button from '@/components/Button';
import { useApp } from '../context/AppManagement';
import { useProgress } from '@react-three/drei';
import { useTranslations } from 'use-intl';

const loadingDuration = 0.35;

/**
 * HOC for App Components
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
const withLoading = (WrappedComponent) => {
  return (props) => {
    const { ready } = useApp();
    const t = useTranslations('Loading');
    const buttonLoadRef = useRef();
    const {
      progress: ThreeJSProgress,
      active: ThreeJSActive,
      errors,
    } = useProgress();
    const [loaded, setLoaded] = useState(false);
    const [assetName, setAssetName] = useState('');
    const [progress, setProgress] = useState(0);

    const progressRef = useRef({
      value: 0,
    });

    const timeoutFont = 5000;

    const [isFontLoaded, setFontLoaded] = useState(false);

    // List of possible loading assets
    const [loadingTotal, setLoadingTotal] = useState([
      {
        type: 'Font',
        value: 0,
      },
      {
        type: 'Model',
        value: 0,
      },
    ]);

    const fontObserve = useFontFaceObserver(
      [
        {
          family: '3ds Bold',
          weight: '700',
        },
        {
          family: '3ds Bold Italic',
          weight: '700',
          style: 'italic',
        },
        {
          family: '3ds Semibold',
          weight: '600',
        },
        {
          family: '3ds Semibold Italic',
          weight: '600',
          style: 'italic',
        },
        {
          family: '3ds Regular',
          weight: '400',
        },
        {
          family: '3ds Italic',
          weight: '400',
          style: 'italic',
        },
        {
          family: '3ds Light',
          weight: '300',
        },
        {
          family: '3ds Light Italic',
          weight: '300',
          style: 'italic',
        },
      ],
      {
        timeout: timeoutFont,
      }
    );

    // Force font loaded status if internet connectivity is slow more than 5 seconds.
    // If not, font loading is always return false due to timeout exception
    useEffect(() => {
      if (fontObserve) setFontLoaded(fontObserve);
      const timer = setTimeout(() => {
        if (!isFontLoaded) {
          setFontLoaded(true);
        }
      }, timeoutFont);

      return () => clearTimeout(timer);
    }, [isFontLoaded, fontObserve]);

    // Set Loading Total based on loading value
    useEffect(() => {
      setLoadingTotal((prev) => {
        const loading = prev.map((val) => {
          switch (val.type) {
            case 'Font':
              val.value = isFontLoaded ? 100 : 0;
              break;

            case 'Model':
              val.value = ThreeJSProgress;
              break;
          }

          return val;
        });
        return loading;
      });
    }, [ThreeJSProgress, ThreeJSActive, isFontLoaded, ready]);

    // Dynamic loading calculator happen here
    useGSAP(
      () => {
        const loaded = loadingTotal.filter((val) => val.value === 100);

        if (loaded.length > 0) {
          gsap.to(progressRef.current, {
            value: (loaded.length / loadingTotal.length) * 100,
            duration: loadingDuration,
            onStart: () =>
              setAssetName(
                t(
                  loaded[
                    Math.floor(loaded.length / loadingTotal.length)
                  ].type.toLowerCase()
                )
              ),
            onUpdate: ({ value }) => setProgress(value),
            onUpdateParams: [progressRef.current],
            onComplete: () => {
              if (progressRef.current.value === 100) {
                gsap.to(buttonLoadRef.current, {
                  delay: loadingDuration,
                  opacity: 0,
                  duration: loadingDuration,
                  onComplete: () => {
                    setLoaded(true);
                  },
                });
              }
            },
          });
        }
      },
      {
        dependencies: [ready, loadingTotal, ThreeJSActive, progressRef.current],
      }
    );

    const loadText = ready
      ? progress !== 100
        ? t('text') + ' ' + assetName
        : 'Asset Loaded'
      : t('text') + '...';

    return (
      <>
        <Button
          ref={buttonLoadRef}
          disabled={true}
          $buttonType="scream"
          $size="large"
          $weight="bold"
          $other={
            /* tailwindcss */ 'mx-auto fixed z-100 top-[50%] left-[50%] -translate-1/2'
          }
        >
          {progress.toFixed(0) + '% ' + loadText}
        </Button>
        <WrappedComponent progress={progress} loaded={loaded} {...props} />
      </>
    );
  };
};

export default withLoading;
