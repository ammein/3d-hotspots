/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/refs */
import { Html } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useModelState } from '@/components/context/ModelManagement';
import NodeGraph from '@/components/NodeGraph';
import { Vector3, Color, Spherical } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { OrbitControls } from '@three-extras/controls/OrbitControls';
import NodeGraphSVG from '@/assets/node-graph-circle.svg?react';
import withTheatreManagement from '@/components/hoc/TheatreManagement';
import { types } from '@theatre/core';
import RulerPicker from '@/components/Ruler';
import HtmlCSS from '@/stylesheets/modules/Html.module.css';
import UiCSS from '@/stylesheets/modules/Ui.module.css';

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
  }, [makeDefault, cameraRef, set, oldControls, oldCamera]);

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

  useImperativeHandle(ref, () => orbitControlsRef.current, []);

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
const UI = ({ start, loaded, ...rest }) => {
  /** @type {import('react').Ref<import('@three-extras/controls/OrbitControls').OrbitControls>} */
  const orbitRef = useRef();

  const { Point: PointTheatreJS, Line: LineTheatreJS, Ruler: RulerTheatreJS } = rest.theatre;

  /** @type {import('react').Ref<import('three').OrthographicCamera>} */
  const orthoCameraRef = useRef();

  const state = useModelState();

  const hotspots = useMemo(() => {
    return state.hotspotData.map((val, i) => {
      const dir = val.lines[0].clone().normalize();

      return (
        <NodeGraph
          key={val.name + i}
          name={val.name}
          active={state.hotspotID}
          material={{
            lineWidth: LineTheatreJS.lineWidth,
            color: new Color(LineTheatreJS.lineColor.r, LineTheatreJS.lineColor.g, LineTheatreJS.lineColor.b),
          }}
          geometry={{
            points: [new Vector3(0, 0, 0), dir],
          }}
          pointColor={new Color(
            PointTheatreJS.pointColor.r,
            PointTheatreJS.pointColor.g,
            PointTheatreJS.pointColor.b
          ).convertSRGBToLinear()}
          pointSize={PointTheatreJS.pointSize}
          activeColor={new Color(
            PointTheatreJS.activeColor.r,
            PointTheatreJS.activeColor.g,
            PointTheatreJS.activeColor.b
          ).convertSRGBToLinear()}
          sphereOpac={PointTheatreJS.opacity}
          lineOpac={LineTheatreJS.opacity}
          dashArray={LineTheatreJS.dashArray}
          dashOffset={LineTheatreJS.dashOffset}
          dashRatio={LineTheatreJS.dashRatio}
        />
      );
    });
  }, [state.hotspotData, state.hotspotID, PointTheatreJS, LineTheatreJS]);

  useFrame(({ gl, scene }) => {
    if (orthoCameraRef.current) {
      gl.render(scene, orthoCameraRef.current);
      gl.clearDepth(); // Clear Background Render to make Alpha Background
    }
  });

  return (
    <Html fullscreen wrapperClass={HtmlCSS.WrapperHtml} className={HtmlCSS.HtmlContainer}>
      <div className={UiCSS.NodeGraphContainer}>
        {start && (
          <Canvas
            dpr={[1, 2]}
            style={{
              width: '100px',
              height: '100px',
            }}
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
            <Html fullscreen wrapperClass={HtmlCSS.WrapperNodeGraphSVG} className={HtmlCSS.NodeGraphSVGContainer}>
              <div className={UiCSS.NodeGraphSVG}>
                <NodeGraphSVG />
              </div>
            </Html>
          </Canvas>
        )}
        {start && (
          <RulerPicker
            min={0}
            width={RulerTheatreJS.width}
            height={RulerTheatreJS.height}
            unit={RulerTheatreJS.unit}
            max={360 * 2}
            step={RulerTheatreJS.step}
            valueTextStyle={RulerTheatreJS.valueTextStyle}
            unitTextStyle={RulerTheatreJS.unitTextStyle}
            stepWidth={RulerTheatreJS.stepWidth}
            gapBetweenSteps={RulerTheatreJS.gapBetweenSteps}
            indicatorColor={`rgba(${RulerTheatreJS.indicatorColor.r * 255}, ${RulerTheatreJS.indicatorColor.g * 255}, ${
              RulerTheatreJS.indicatorColor.b * 255
            }, 1)`}
            indicatorHeight={RulerTheatreJS.indicatorHeight}
            shortStepColor={`rgba(${RulerTheatreJS.shortStepColor.r * 255}, ${RulerTheatreJS.shortStepColor.g * 255}, ${
              RulerTheatreJS.shortStepColor.b * 255
            })`}
            shortStepHeight={RulerTheatreJS.shortStepHeight}
            longStepColor={`rgba(${RulerTheatreJS.longStepColor.r * 255}, ${RulerTheatreJS.longStepColor.g * 255}, ${
              RulerTheatreJS.longStepColor.b * 255
            })`}
            longStepHeight={RulerTheatreJS.longStepHeight}
            fractionDigits={RulerTheatreJS.fractionDigits}
            indicatorXOffset={RulerTheatreJS.indicatorXOffset}
            initialValue={state.rotationDegree}
          />
        )}
      </div>
    </Html>
  );
};

const UITheatreJS = withTheatreManagement(UI, 'Scene / UI', {
  Ruler: {
    props: {
      width: types.number(100, {
        range: [1, window.innerWidth],
        nudgeMultiplier: 1,
      }),
      height: types.number(16, {
        range: [1, window.innerHeight],
        nudgeMultiplier: 1,
      }),
      unit: types.string('°', {
        label: 'Unit Label',
      }),
      step: types.number(1, {
        range: [1, 360],
        nudgeMultiplier: 1,
      }),
      stepWidth: types.number(1, {
        range: [0.01, 100],
        nudgeMultiplier: 0.01,
      }),
      gapBetweenSteps: types.number(5, {
        range: [1, 100],
        nudgeMultiplier: 1,
      }),
      indicatorColor: types.rgba({
        r: 0,
        g: 0.34,
        b: 0.53,
        a: 1,
      }),
      indicatorHeight: types.number(26, {
        nudgeMultiplier: 1,
      }),
      indicatorXOffset: types.number(0.4, {
        nudgeMultiplier: 0.01,
      }),
      shortStepColor: types.rgba({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      }),
      shortStepHeight: types.number(18, {
        nudgeMultiplier: 1,
      }),
      longStepColor: types.rgba({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      }),
      longStepHeight: types.number(21, {
        nudgeMultiplier: 1,
      }),
      fractionDigits: types.number(0, {
        nudgeMultiplier: 1,
      }),
      valueTextStyle: types.compound({
        color: types.rgba({
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        }),
        fontSize: types.number(12, {
          nudgeMultiplier: 0.01,
        }),
      }),
      unitTextStyle: types.compound({
        color: types.rgba({
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        }),
        fontSize: types.number(12, {
          nudgeMultiplier: 0.01,
        }),
      }),
    },
    options: {
      reconfigure: true,
    },
  },
  Point: {
    props: {
      pointSize: types.number(0.1, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
        label: 'Size',
      }),
      pointColor: types.rgba(
        {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        {
          label: 'Color',
        }
      ),
      activeColor: types.rgba(
        {
          r: 8 / 255,
          g: 112 / 255,
          b: 211 / 255,
          a: 1,
        },
        {
          label: 'Active',
        }
      ),
      opacity: types.compound({
        behind: types.number(0.5, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        front: types.number(1, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
      }),
    },
    options: {
      reconfigure: true,
    },
  },
  Line: {
    props: {
      lineWidth: types.number(0.02, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
        label: 'Width',
      }),
      lineColor: types.rgba(
        {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        {
          label: 'Color',
        }
      ),
      opacity: types.compound({
        behind: types.number(0.5, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        front: types.number(1, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
      }),
      dashArray: types.compound({
        behind: types.number(0.1, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        front: types.number(0, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
      }),
      dashOffset: types.compound({
        behind: types.number(0.1, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        front: types.number(0, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
      }),
      dashRatio: types.compound({
        behind: types.number(0.1, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
        front: types.number(0, {
          range: [0, 1],
          nudgeMultiplier: 0.01,
        }),
      }),
    },
    options: {
      reconfigure: true,
    },
  },
});

export default UITheatreJS;
