import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';
import { useApp } from '../context/AppManagement';
import { useModelDispatch, useModelState } from '@/components/context/ModelManagement';
import { Html, PerspectiveCamera } from '@react-three/drei';
import Button from '@/components/Button';
import { useTranslations } from 'use-intl';
import Headline from '@/components/Headline';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { editable } from '@theatre/r3f';
import HtmlCSS from '@/stylesheets/modules/Html.module.css';
import HeadlineCSS from '@/stylesheets/modules/Headline.module.css';
import MainCSS from '@/stylesheets/modules/Main.module.css';

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
  const t_UI = useTranslations('UI');

  const dispatch = useModelDispatch();
  const state = useModelState();

  /** @type {import('react').Ref<import('react').HTMLProps<HTMLDivElement>>} */
  const containerRef = useRef();

  /** @type {import('react').Ref<import('react').HTMLProps<HTMLHeadingElement>>} */
  const headlineRef = useRef();

  const [headlineActive, setHeadline] = useState(false);

  const { appProject, metadata } = useApp();

  useGSAP(
    () => {
      const el = headlineRef.current;
      if (start && el && headlineActive && ModelTheatreJS.model.id) {
        const typeHeading = gsap.timeline({ paused: true });
        typeHeading
          .from(el, {
            duration: 1,
            text: {
              value: '',
              type: 'diff',
            },
          })

          .to(el, {
            duration: 0.6,
            text: {
              value: t('title'),
              type: 'diff',
            },
          });
        typeHeading.play(0);
      }
    },
    {
      dependencies: [start, ModelTheatreJS, headlineActive],
      scope: containerRef,
    }
  );

  return (
    <>
      {ModelTheatreJS && ModelTheatreJS.model.id && (
        <ErrorBoundary fallback={Error}>
          <EditableCamera theatreKey="Camera" makeDefault />
          {/* Important to set Editable Ambient Light & Point Light to here. 
          Since everything under this will be controlled by TheatreJS in snapshot */}
          <editable.ambientLight theatreKey="Ambient Light" intensity={ambientLightIntensity} />
          <editable.pointLight theatreKey="Point Light" intensity={10} position={[0, 3, 0]} />
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
            <Html fullscreen wrapperClass={HtmlCSS.WrapperHtml} className={HtmlCSS.HtmlContainer}>
              <div ref={containerRef} className={MainCSS.TitleContainer}>
                <Headline
                  ref={(newRef) => {
                    headlineRef.current = newRef;
                    setHeadline(true);
                    return headlineRef;
                  }}
                  type="h2"
                  weight="bold"
                  color={`${HeadlineCSS.Headline} headline-title`}
                ></Headline>
              </div>
              <div className={MainCSS.MaterialButtonContainer}>
                <Button
                  buttonType={state.wireframe ? 'scream' : 'shout'}
                  size="large"
                  weight="bold"
                  label={t_UI('wireframe.label')}
                  seo={t_UI('wireframe.seo')}
                  other={MainCSS.TabButton}
                  metadata={metadata}
                  onClick={() =>
                    dispatch({
                      type: 'wireframe',
                      value: true,
                    })
                  }
                >
                  {t_UI('wireframe.label')}
                </Button>
                <Button
                  buttonType={state.wireframe ? 'shout' : 'scream'}
                  size="large"
                  weight="bold"
                  other={MainCSS.TabButton}
                  label={t_UI('solid.label')}
                  seo={t_UI('solid.seo')}
                  metadata={metadata}
                  onClick={() =>
                    dispatch({
                      type: 'wireframe',
                      value: false,
                    })
                  }
                >
                  {t_UI('solid.label')}
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
