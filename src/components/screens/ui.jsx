import { Html } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useModelState } from '@/components/context/ModelManagement';
import NodeGraph from '@/components/NodeGraph';
import { Vector3, Color, Spherical } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { OrbitControls } from '@three-extras/controls/OrbitControls';
import NodeGraphSVG from '@/assets/node-graph-circle.svg?react';

extend({ OrbitControls });

/**
 * @typedef {Object} OrthoUIControls
 * @property {import('react').Ref} ref
 * @property {import('react').Ref<import('three').OrthographicCamera>} cameraRef
 * @property {number} degree
 * @property {boolean} makeDefault
 */

/**
 * Controls Component
 * @param {OrthoUIControls} param0
 * @returns
 */
function Controls({ ref, cameraRef, degree, sign, makeDefault }) {
  // local refs for smoothing
  const currentAzimuthRef = useRef(null);
  const orbitControlsRef = useRef();
  const {
    gl: { domElement },
    controls: oldControls,
    camera: oldCamera,
    set,
  } = useThree();

  useEffect(() => {
    if (makeDefault && orbitControlsRef.current && cameraRef.current) {
      orbitControlsRef.current.enableRotate = false;
      set({ controls: orbitControlsRef.current });
      set({ camera: cameraRef.current });
    }

    return () => {
      set({ controls: oldControls, camera: oldCamera });
    };
  }, [makeDefault, orbitControlsRef.current, cameraRef.current]);

  useFrame(({ camera }) => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    // compute spherical from camera position relative to target
    const offset = new Vector3().copy(camera.position).sub(controls.target);
    const spherical = new Spherical().setFromVector3(offset);

    const targetAzimuth = degToRad(degree);

    // smoothing (optional)
    if (currentAzimuthRef.current === null) currentAzimuthRef.current = spherical.theta;
    const lerpFactor = 0.12;
    currentAzimuthRef.current = currentAzimuthRef.current + (targetAzimuth - currentAzimuthRef.current) * lerpFactor;
    spherical.theta = currentAzimuthRef.current;

    // convert back
    const newPos = new Vector3().setFromSpherical(spherical).add(controls.target);
    camera.position.copy(newPos);
    camera.lookAt(controls.target);
    controls.update();
  });

  useImperativeHandle(ref, () => orbitControlsRef.current, [ref]);

  return <orbitControls ref={orbitControlsRef} args={[cameraRef.current, domElement]} />;
}

/*
  From this forum
  https://discourse.threejs.org/t/how-to-controll-minimap-like-games-location-and-area/66948
*/

/**
 * UI Scene
 * @param {import('@/components/hoc/TheatreManagement').TheatreReturnValue & { start: boolean, loaded: boolean } & import('@/components/context/ModelManagement').ModelManagement} param0
 * @returns
 */
const Ui = ({ start, loaded, ...rest }) => {
  /** @type {import('react').Ref<import('@three-extras/controls/OrbitControls').OrbitControls>} */
  const orbitRef = useRef();

  /** @type {import('react').Ref<import('three').OrthographicCamera>} */
  const orthoCameraRef = useRef();

  const state = useModelState();

  const { size } = useThree();

  const hotspots = useMemo(() => {
    return state.hotspotData.map((val, i) => {
      const dir = val.lines[0].clone().normalize();

      return (
        <NodeGraph
          key={val.name + i}
          name={val.name}
          active={state.hotspotID}
          material={{
            lineWidth: 0.02,
            color: new Color('black'),
          }}
          geometry={{
            points: [new Vector3(0, 0, 0), dir.multiplyScalar(1)],
          }}
        />
      );
    });
  }, [state.hotspotData, state.hotspotID]);

  useFrame(({ gl, scene }) => {
    if (orthoCameraRef.current) {
      gl.render(scene, orthoCameraRef.current);
      gl.clearDepth();
    }
  });

  return (
    <Html
      fullscreen
      wrapperClass={/* tailwindcss */ 'pointer-events-none size-full !transform-none'}
      className={/* tailwindcss */ '!transform-none !left-0 !top-0 !size-full'}
    >
      {start && (
        <Canvas
          dpr={[1, 2]}
          style={{
            width: '100px',
            height: '100px',
          }}
          className="right-[27px] top-[23px] !absolute bg-transparent"
        >
          {/* UI Scene */}
          {/* Orthographic Camera for UI overlay */}
          <orthographicCamera
            ref={orthoCameraRef}
            left={-1}
            right={1}
            top={1}
            bottom={-1}
            near={0}
            far={1000}
            position={[0, 0, 10]}
          />
          {/* Minimap plane in the top-right corner */}
          {hotspots}
          {orthoCameraRef.current && (
            <Controls
              ref={orbitRef}
              cameraRef={orthoCameraRef}
              degree={state.rotationDegree}
              sign={state.rotationSign}
              makeDefault
            />
          )}
          <Html
            prepend
            fullscreen
            wrapperClass={/* tailwindcss */ 'pointer-events-none size-full !transform-none'}
            className={/* tailwindcss */ '!transform-none !left-0 !top-0 !right-0 !size-full'}
            style={{}}
          >
            <div className="size-full flex justify-center items-center text-2xl">
              <NodeGraphSVG />
            </div>
          </Html>
        </Canvas>
      )}
    </Html>
  );
};

export default Ui;
