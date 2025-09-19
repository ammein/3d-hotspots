import { useEffect, useRef, useState } from 'react';
import useFontFaceObserver from 'use-font-face-observer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Button from '@/components/Button';
import { useApp } from '../context/AppManagement';
import { useProgress } from '@react-three/drei';

const loadingDuration = 0.5;

/**
 * HOC for App Components
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
const withLoading = (WrappedComponent) => {
  return (props) => {
    const { ready, msg } = useApp();
    const buttonLoadRef = useRef();
    const { progress: ThreeJSProgress } = useProgress();
    const [loaded, setLoaded] = useState(false);
    const [assetName, setAssetName] = useState('');
    const [progress, setProgress] = useState(0);

    const progressRef = useRef({
      value: 0,
    });

    const t = gsap.to(
      {},
      {
        duration: 1.0,
        ease: 'none',
        paused: true,
      }
    );

    const isFontLoaded = useFontFaceObserver([
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
    ]);

    const [loadingTotal, setLoadingTotal] = useState([
      {
        type: 'Font',
        value: isFontLoaded ? 100 : 0,
      },
      {
        type: 'Model',
        value: ThreeJSProgress,
      },
    ]);

    useEffect(() => {
      if (ready) {
        setLoadingTotal((prev) => {
          const loading = [
            {
              type: 'Font',
              value: isFontLoaded ? 100 : 0,
            },
            {
              type: 'Model',
              value: ThreeJSProgress,
            },
          ];
          return loading;
        });
      }
    }, [ThreeJSProgress, isFontLoaded, ready]);

    useGSAP(
      () => {
        if (ready) {
          const loaded = loadingTotal.filter((val) => val.value === 100);

          if (loaded.length > 0) {
            gsap.to(progressRef.current, {
              value: (loaded.length / loadingTotal.length) * 100,
              duration: loadingDuration,
              onStart: () =>
                setAssetName(
                  loaded[Math.floor(loaded.length / loadingTotal.length)].type
                ),
              onUpdate: ({ value }) => setProgress(value),
              onUpdateParams: [progressRef.current],
              onComplete: () => {
                if (progressRef.current.value === 100) {
                  gsap.to(buttonLoadRef.current, {
                    delay: loadingDuration,
                    opacity: 0,
                    duration: loadingDuration,
                    onComplete: () => setLoaded(true),
                  });
                }
              },
            });
          }
        }
      },
      {
        dependencies: [
          ready,
          loadingTotal,
          progress,
          progressRef.current,
          ThreeJSProgress,
          isFontLoaded,
        ],
      }
    );

    const loadText =
      ready && progressRef.current && progressRef.current.value !== 100
        ? msg('Loading') + ' ' + assetName
        : 'Asset Loaded';

    return (
      <>
        {ready && (
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
        )}
        <WrappedComponent progress={progress} loaded={loaded} {...props} />
      </>
    );
  };
};

export default withLoading;
