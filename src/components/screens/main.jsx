import { useThree } from '@react-three/fiber';
import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import { editable as e } from '@theatre/r3f';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';
import { useApp } from '../context/AppManagement';
import withModelManagement from '../hoc/ModelManagement';
import { Html } from '@react-three/drei';
import Button from '@/components/Button';
import { useWindowSize } from '@uidotdev/usehooks';
import { useTranslations } from 'use-intl';
import Headline from '@/components/Headline';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ambientLightIntensity = Math.PI / 2.0;

/**
 * Main Scene
 * @param {import('@/components/hoc/TheatreManagement').TheatreReturnValue & { start: boolean, loaded: boolean } & import('@/components/hoc/ModelManagement').ModelManagement} param0
 * @returns
 */
const Main = ({ start, loaded, ...rest }) => {
  const { Model: ModelTheatreJS } = rest.theatre;

  const t = useTranslations('Splash');

  /** @type {import('react').Ref<import('react').HTMLProps<HTMLHeadingElement>>} */
  const headlineRef = useRef();

  const windowSize = useWindowSize();

  const { appProject } = useApp();

  useGSAP(() => {
    if (start && headlineRef.current && ModelTheatreJS.model.id) {
      const typeHeading = gsap.timeline({ paused: true });
      typeHeading
        .from(headlineRef.current, {
          duration: 1,
          text: {
            value: '',
            type: 'diff',
          },
        })

        .to(headlineRef.current, {
          duration: 0.6,
          text: {
            value: t('title'),
            type: 'diff',
          },
        });
      typeHeading.play(0).delay(1);
    }
  }, [start, headlineRef.current, ModelTheatreJS]);

  return (
    <>
      {ModelTheatreJS && ModelTheatreJS.model.id && (
        <ErrorBoundary fallback={Error}>
          {/* Important to set Editable Ambient Light & Point Light to here. 
          Since everything under this will be controlled by TheatreJS in snapshot */}
          <e.ambientLight theatreKey="Ambient Light" intensity={ambientLightIntensity} />
          <e.pointLight theatreKey="Point Light" intensity={10} position={[0, 3, 0]} />
          <Model
            start={start}
            loaded={loaded}
            url={appProject.getAssetUrl(ModelTheatreJS.model)}
            useDraco={ModelTheatreJS.draco}
            useKTX2={ModelTheatreJS.ktx2}
            animationNames={ModelTheatreJS.animations.length > 0 ? ModelTheatreJS.animations.split(',') : []}
            hideItems={ModelTheatreJS.hideItems.length > 0 ? ModelTheatreJS.hideItems.split(',') : []}
          />
          {start && (
            <Html as="div" fullscreen wrapperClass="pointer-events-none">
              {/* TODO: Add Ruler Here https://www.npmjs.com/package/react-native-ruler-picker?activeTab=readme */}
              <div
                className="flex fixed w-screen h-auto"
                style={{
                  top: -windowSize.height / 2 + 41,
                  left: -windowSize.width / 2 + 28,
                }}
              >
                <Headline ref={headlineRef} type="h2" weight="bold" color={/* tailwindcss */ 'text-corporateblue'}>
                  {t('title')}
                </Headline>
              </div>
              <div
                className="flex fixed size-fit pointer-events-auto"
                style={{
                  bottom: -windowSize.height / 2 + 30,
                  left: -windowSize.width / 2 + 28,
                }}
              >
                <Button $buttonType="shout" $size="large" $weight="bold" $other={/* tailwindcss */ '!rounded-none'}>
                  Wireframe
                </Button>
                <Button $buttonType="scream" $size="large" $weight="bold" $other={/* tailwindcss */ '!rounded-none'}>
                  Solid
                </Button>
              </div>
            </Html>
          )}
        </ErrorBoundary>
      )}
    </>
  );
};

const MainTheatre = withTheatreManagement(Main, 'Scene / Main', {
  Model: {
    props: {
      draco: types.boolean(true, {
        label: 'Use Draco Loader',
      }),
      ktx2: types.boolean(true, {
        label: 'Use KTX2 Loader',
      }),
      model: types.file(undefined, {
        label: 'Model Asset',
      }),
      animations: types.string('', {
        label: "List of Animations (To activate multiple animations, use ',')",
      }),
      hideItems: types.string('', {
        label: "Hide Items (Multiple items, use ',')",
      }),
    },
  },
});

const MainScene = withModelManagement(MainTheatre);

export default MainScene;
