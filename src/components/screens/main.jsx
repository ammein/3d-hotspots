import { useFrame } from '@react-three/fiber';
import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import { OrbitControls } from '@react-three/drei';
import { editable as e } from '@theatre/r3f';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';
import { Suspense } from 'react';

const ambientLightIntensity = Math.PI / 2.0;

const Main = ({ theatre, start, loaded }) => {
  const { ['Orbit Controls']: OrbitControlsTheatreJS, Main: MainTheatreJS } =
    theatre;

  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
  }, 1);

  return (
    <>
      <e.ambientLight
        theatreKey="Ambient Light"
        intensity={ambientLightIntensity}
      />
      <e.pointLight
        theatreKey="Point Light"
        intensity={10}
        position={[0, 3, 0]}
      />
      {MainTheatreJS && MainTheatreJS.model.length > 0 && (
        <ErrorBoundary fallback={Error}>
          <Suspense fallback={null}>
            <Model
              start={start}
              loaded={loaded}
              url={MainTheatreJS.model}
              useDraco={MainTheatreJS.draco}
              useKTX2={MainTheatreJS.ktx2}
              animationNames={
                MainTheatreJS.animations.length > 0
                  ? MainTheatreJS.animations.split(',')
                  : []
              }
              hideItems={
                MainTheatreJS.hideItems.length > 0
                  ? MainTheatreJS.hideItems.split(',')
                  : []
              }
            />
          </Suspense>
        </ErrorBoundary>
      )}
      <OrbitControls
        autoRotate={OrbitControlsTheatreJS && OrbitControlsTheatreJS.autoRotate}
        enableZoom={OrbitControlsTheatreJS && OrbitControlsTheatreJS.enableZoom}
        enablePan={OrbitControlsTheatreJS && OrbitControlsTheatreJS.enablePan}
        enableRotate={
          OrbitControlsTheatreJS && OrbitControlsTheatreJS.enableRotate
        }
      />
    </>
  );
};

const MainScene = withTheatreManagement(Main, 'Scene / Main', {
  Main: {
    props: {
      draco: types.boolean(true, {
        label: 'Use Draco Loader',
      }),
      ktx2: types.boolean(true, {
        label: 'Use KTX2 Loader',
      }),
      model: types.string('', {
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
  'Orbit Controls': {
    props: {
      autoRotate: types.boolean(true, {
        label: 'Auto Rotate Model',
      }),
      enableZoom: types.boolean(false, {
        label: 'Enable Zoom',
      }),
      enablePan: types.boolean(false, {
        label: 'Enable Pan',
      }),
      enableRotate: types.boolean(false, {
        label: 'Enable Rotate',
      }),
    },
  },
});

export default MainScene;
