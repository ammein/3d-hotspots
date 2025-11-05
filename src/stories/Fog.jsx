import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import PropTypes from 'prop-types';
import { GlslPipelineReact } from 'glsl-pipeline/r3f';
import fragmentShader from '@/glsl/stories/main.frag';
import vertexShader from '@/glsl/stories/main.vert';
import { useEffect, useRef } from 'react';
import { BufferGeometryUtils } from '@three-extras/Addons';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';

function PlyModel({ url, cameraPos = [0, 0, 3], debug }) {
  const obj = useLoader(PLYLoader, url);
  /** @type {import('react').Ref<import('glsl-pipeline').GlslPipeline>} */
  const shaderRef = useRef();
  /** @type {import('react').Ref<import('three').PointLight>} */
  const lightRef = useRef();

  const modelObj = useRef(obj);

  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
    if (shaderRef.current && lightRef.current && obj) {
      // Smooth surface
      // modelObj.current.deleteAttribute('normal');
      // modelObj.current = BufferGeometryUtils.mergeVertices(obj);
      // modelObj.current.computeVertexNormals();
      shaderRef.current.setLight(lightRef.current);
    }
  }, [shaderRef, lightRef, camera.position, modelObj, cameraPos, obj, camera]);

  return (
    <>
      <pointLight
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
        <GlslPipelineReact
          ref={shaderRef}
          defines={{
            DEBUG: debug,
            LIGHT_SHADOWMAP: 1,
          }}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
        />
      </mesh>
    </>
  );
}

export const Fog = ({ intensity = 0.5, shadowMap = true, cameraPos, debug = false }) => {
  return (
    <Canvas
      gl={{
        shadowMap: {
          enabled: shadowMap,
        },
      }}
      style={{
        width: '100%',
      }}
    >
      <OrbitControls />
      <ambientLight intensity={intensity} />
      <PlyModel url={'/head.ply'} cameraPos={cameraPos} debug={debug} /> {/* Replace with your PLY file path */}
    </Canvas>
  );
};

Fog.propTypes = {
  intensity: PropTypes.number,
  shadowMap: PropTypes.bool,
  cameraPos: PropTypes.arrayOf(PropTypes.number),
  debug: PropTypes.bool,
};
