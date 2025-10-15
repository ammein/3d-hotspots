import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import { editable as e } from '@theatre/r3f';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';
import { useApp } from '../context/AppManagement';
import { useModelDispatch, useModelState } from '@/components/context/ModelManagement';
import { Html, PerspectiveCamera } from '@react-three/drei';
import Button from '@/components/Button';
import { useTranslations } from 'use-intl';
import Headline from '@/components/Headline';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFrame } from '@react-three/fiber';
import { Vector4 } from 'three';
import { editable } from '@theatre/r3f';

const ambientLightIntensity = Math.PI / 2.0;

const EditableCamera = editable(PerspectiveCamera, 'perspectiveCamera');

/**
 * Main Scene
 * @param {import('@/components/hoc/TheatreManagement').TheatreReturnValue & { start: boolean, loaded: boolean } & import('@/components/context/ModelManagement').ModelManagement} param0
 * @returns
 */
const Main = ({ start, loaded, ...rest }) => {
  const { Model: ModelTheatreJS } = rest.theatre;

  const t = useTranslations('Splash');

  const dispatch = useModelDispatch();
  const state = useModelState();

  /** @type {import('react').Ref<import('react').HTMLProps<HTMLHeadingElement>>} */
  const headlineRef = useRef();

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
      typeHeading.play(0);
    }
  }, [start, headlineRef.current, ModelTheatreJS]);

  return (
    <>
      {ModelTheatreJS && ModelTheatreJS.model.id && (
        <ErrorBoundary fallback={Error}>
          <EditableCamera theatreKey="Camera" makeDefault />
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
          {start && state && (
            <Html
              fullscreen
              wrapperClass={/* tailwindcss */ 'pointer-events-none size-full !transform-none'}
              className={/* tailwindcss */ '!transform-none !left-0 !top-0 !size-full'}
            >
              <div
                className="flex fixed w-screen h-auto"
                style={{
                  top: 41,
                  left: 28,
                }}
              >
                <Headline
                  ref={headlineRef}
                  type="h2"
                  weight="bold"
                  color={/* tailwindcss */ 'text-corporateblue'}
                ></Headline>
              </div>
              <div
                className="flex fixed size-fit pointer-events-auto"
                style={{
                  bottom: 30,
                  left: 28,
                }}
              >
                <Button
                  $buttonType={state.wireframe ? 'scream' : 'shout'}
                  $size="large"
                  $weight="bold"
                  $other={/* tailwindcss */ '!rounded-none'}
                  onClick={(e) =>
                    dispatch({
                      type: 'wireframe',
                      value: true,
                    })
                  }
                >
                  Wireframe
                </Button>
                <Button
                  $buttonType={state.wireframe ? 'shout' : 'scream'}
                  $size="large"
                  $weight="bold"
                  $other={/* tailwindcss */ '!rounded-none'}
                  onClick={(e) =>
                    dispatch({
                      type: 'wireframe',
                      value: false,
                    })
                  }
                >
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
    options: {
      reconfigure: true,
    },
  },
});

export default MainTheatre;
