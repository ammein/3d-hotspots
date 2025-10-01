import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@three-extras/controls/OrbitControls';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { useFrame } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useMemo } from 'react';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';

const _STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6,
};

export class PowerOrbitControls extends OrbitControls {
  constructor(object, element = null, orientation = 'horizontal') {
    super(object, element);
    this.orientation = orientation;
  }

  update(deltaTime = null) {
    super.update(deltaTime);
    if (
      this.autoRotate &&
      this.state === _STATE.NONE &&
      this.orientation === 'vertical'
    ) {
      this._spherical.phi = this._spherical.phi;
      super._rotateUp(super._getAutoRotationAngle(deltaTime));
    }
  }
}

const Orbit = ({ theatre, ref, makeDefault, enabled = true }) => {
  const { ['Orbit Controls']: OrbitControlsTheatreJS } = theatre;

  const { camera, gl, get, set } = useThree();

  /** @typedef {PowerOrbitControls} */
  let myOrbit = useMemo(() => {
    let myOrbit = new PowerOrbitControls(
      camera,
      gl.domElement,
      OrbitControlsTheatreJS ? OrbitControlsTheatreJS.orientation : 'horizontal'
    );
    if (
      OrbitControlsTheatreJS &&
      Object.keys(OrbitControlsTheatreJS).length > 0
    ) {
      if (OrbitControlsTheatreJS.orientation === 'horizontal') {
        myOrbit.minAzimuthAngle = -Infinity;
        myOrbit.maxAzimuthAngle = Infinity;
        myOrbit.minPolarAngle = OrbitControlsTheatreJS.minPolarAngle * DEG2RAD;
        myOrbit.maxPolarAngle = OrbitControlsTheatreJS.maxPolarAngle * DEG2RAD;
      } else if (OrbitControlsTheatreJS.orientation === 'vertical') {
        console.log('Vertical');
        myOrbit.minPolarAngle = -Infinity;
        myOrbit.maxPolarAngle = Infinity;
        myOrbit.minAzimuthAngle = 0;
        myOrbit.maxAzimuthAngle = 0;
      }
      myOrbit.enabled = enabled;
      myOrbit.autoRotate = enabled ? OrbitControlsTheatreJS.autoRotate : false;
      myOrbit.enablePan = OrbitControlsTheatreJS.enablePan;
      myOrbit.enableRotate = enabled
        ? OrbitControlsTheatreJS.enableRotate
        : false;
      myOrbit.enableZoom = OrbitControlsTheatreJS.enableZoom;

      // Must manually set target to my custom power control, buggy happens when setting the controls directly if `makeDefault` happens
      if (makeDefault) {
        myOrbit.target = get().controls.target;
      }
    }

    return myOrbit;
  }, [OrbitControlsTheatreJS, camera, gl, enabled]);

  useFrame(() => {
    if (enabled) myOrbit.update();
  }, -1);

  useEffect(() => {
    if (makeDefault) {
      const old = get().controls;
      set({ controls: myOrbit });
      return () => set({ controls: old });
    }
  }, [makeDefault, myOrbit]);

  useImperativeHandle(ref, () => myOrbit, [myOrbit]);

  return <primitive ref={ref} object={myOrbit} />;
};

const TheatreOrbit = withTheatreManagement(Orbit, 'Model', {
  'Orbit Controls': {
    props: {
      autoRotate: types.boolean(true, {
        label: 'Auto Rotate',
      }),
      enableZoom: types.boolean(false, {
        label: 'Zoom',
      }),
      enablePan: types.boolean(false, {
        label: 'Pan',
      }),
      enableRotate: types.boolean(false, {
        label: 'Rotate',
      }),
      maxPolarAngle: types.number(2 * Math.PI * RAD2DEG, {
        range: [0, 2 * Math.PI * RAD2DEG],
        nudgeMultiplier: 1,
      }),
      minPolarAngle: types.number(0, {
        range: [0, 2 * Math.PI * RAD2DEG],
        nudgeMultiplier: 1,
      }),
      orientation: types.stringLiteral(
        'horizontal',
        {
          horizontal: 'horizontal',
          vertical: 'vertical',
        },
        {
          as: 'switch',
          label: 'Orientation',
        }
      ),
    },
  },
});

export default TheatreOrbit;
