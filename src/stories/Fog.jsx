import { Canvas, useLoader, useThree, extend, useFrame } from '@react-three/fiber';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import PropTypes from 'prop-types';
import Effects from '@/components/Effects';
import { useEffect, useRef, useState } from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { Vector3, DirectionalLight, Color, Uniform } from 'three';

extend({ DirectionalLight });

const PlyModel = ({ url, cameraPos = [0, 0, 3], debug, fogColor, focalRange, documentation, htmlRef }) => {
  const obj = useLoader(PLYLoader, url);
  /** @type {import('react').Ref<import('postprocessing').Effect>} */
  const shaderRef = useRef();
  /** @type {import('react').Ref<import('three').PointLight>} */
  const lightRef = useRef();

  const [focalRangeVal, setFocalRange] = useState(0);

  const modelObj = useRef(obj);

  const { camera } = useThree();

  useEffect(() => {
    modelObj.current.computeBoundingBox();
    const height = modelObj.current.boundingBox.max.y - modelObj.current.boundingBox.min.y;
    camera.position.set(cameraPos[0], cameraPos[1] + height / 2, cameraPos[2]);
    if (shaderRef.current && lightRef.current) {
      // Smooth surface
      shaderRef.current.defines = new Map([['DEBUG', new Uniform(true)]]);
    }
  }, [shaderRef, lightRef, camera.position, modelObj, cameraPos, camera, debug, fogColor]);

  useFrame(({ clock }) => {
    if (documentation) {
      shaderRef.current.uFocalRange = Math.sin(clock.getElapsedTime() / 3) * 10 + 25;
      setFocalRange(shaderRef.current.uFocalRange);
    }
  });

  return (
    <>
      <directionalLight
        castShadow
        ref={lightRef}
        shadow={{
          mapSize: {
            width: 1024,
            height: 1024,
          },
          camera: {
            near: 0.1,
            far: 100,
          },
        }}
        lookAt={new Vector3(0, 1, 0)}
        position={[10, 10, 10]}
      />
      <mesh castShadow receiveShadow>
        {/* eslint-disable-next-line react-hooks/refs */}
        <primitive object={modelObj.current} attach="geometry" />
        {debug ? <meshNormalMaterial /> : <meshBasicMaterial color={'gray'} />}
        <Effects
          uniformsFog={{
            fogColor,
            focalRange,
          }}
          fogRef={shaderRef}
        />
      </mesh>
      {documentation && htmlRef && (
        <Html portal={htmlRef} wrapperClass={/* tailwindcss */ 'left-0 pointer-events-none size-full !transform-none'}>
          <p className="absolute top-0 left-0 text-nowrap">
            Focal Range: <code>{focalRangeVal.toFixed(2)}</code>
          </p>
        </Html>
      )}
    </>
  );
};

export const Fog = ({
  intensity = 0.5,
  shadowMap = true,
  cameraPos,
  debug = false,
  fogColor = 'white',
  focalRange = 0.3,
  documentation = false,
}) => {
  const htmlRef = useRef();

  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        gl={{
          shadowMap: {
            enabled: shadowMap,
          },
        }}
        style={{
          width: '100%',
          height: '100%',
          background: fogColor,
        }}
      >
        <OrbitControls enableZoom={documentation ? false : true} />
        <ambientLight intensity={intensity} />
        <PlyModel
          url={'/head.ply'}
          cameraPos={cameraPos}
          debug={debug}
          fogColor={new Color(fogColor)}
          focalRange={focalRange}
          documentation={documentation}
          htmlRef={htmlRef}
        />
      </Canvas>
      <div ref={htmlRef} className="size-full absolute top-0 pointer-events-none"></div>
    </div>
  );
};

Fog.propTypes = {
  intensity: PropTypes.number,
  focalRange: PropTypes.number,
  fogColor: PropTypes.string,
  shadowMap: PropTypes.bool,
  cameraPos: PropTypes.arrayOf(PropTypes.number),
  debug: PropTypes.bool,
};
