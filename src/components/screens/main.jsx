import { useFrame } from '@react-three/fiber';
import withTheatreManagement from '../hoc/TheatreManagement';
import { types } from '@theatre/core';
import Model from '@/components/Model';
import { editable as e } from '@theatre/r3f';
import Error from '@/components/ThreeJSError';
import ErrorBoundary from '@/components/hoc/ThreeErrorBoundary';

const ambientLightIntensity = Math.PI / 2.0;

const Main = ({ theatre, start, loaded }) => {
  const { Model: ModelTheatreJS } = theatre;

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
});

export default MainScene;
