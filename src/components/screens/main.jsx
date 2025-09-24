import { useFrame, useThree } from '@react-three/fiber';
import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import { OrbitControls } from 'three-stdlib';
import { editable as e } from '@theatre/r3f';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';
import { useEffect } from 'react';

const ambientLightIntensity = Math.PI / 2.0;

const Main = ({ theatre, start, loaded }) => {
  const { ['Orbit Controls']: OrbitControlsTheatreJS, Model: ModelTheatreJS } =
    theatre;

  const { camera, gl } = useThree();

  /** @type {import('three-extras/controls/OrbitControls').OrbitControls} */
  let myOrbit = new OrbitControls(camera, gl.domElement);

  useFrame(({ gl, scene, camera }) => {
    myOrbit.update();
    gl.render(scene, camera);
  }, 1);

  useEffect(() => {
    if (
      OrbitControlsTheatreJS &&
      Object.keys(OrbitControlsTheatreJS).length > 0
    ) {
      myOrbit.dispose();

      myOrbit = new OrbitControls(camera, gl.domElement);
      myOrbit.autoRotate = OrbitControlsTheatreJS.autoRotate;
      myOrbit.enablePan = OrbitControlsTheatreJS.enablePan;
      myOrbit.enableRotate = OrbitControlsTheatreJS.enableRotate;
      myOrbit.enableZoom = OrbitControlsTheatreJS.enableZoom;
    }

    return () => {
      myOrbit.dispose();
    };
  }, [OrbitControlsTheatreJS, camera, gl]);

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
      {ModelTheatreJS && ModelTheatreJS.model.length > 0 && (
        <ErrorBoundary fallback={Error}>
          <Model
            start={start}
            loaded={loaded}
            url={ModelTheatreJS.model}
            useDraco={ModelTheatreJS.draco}
            useKTX2={ModelTheatreJS.ktx2}
            animationNames={
              ModelTheatreJS.animations.length > 0
                ? ModelTheatreJS.animations.split(',')
                : []
            }
            hideItems={
              ModelTheatreJS.hideItems.length > 0
                ? ModelTheatreJS.hideItems.split(',')
                : []
            }
          />
        </ErrorBoundary>
      )}
    </>
  );
};

const MainScene = withTheatreManagement(Main, 'Scene / Main', {
  Model: {
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
