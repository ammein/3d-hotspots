import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@three-extras/controls/OrbitControls';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { useFrame } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useRef } from 'react';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';
import { Vector3 } from 'three';
import { useModelDispatch, useModelState } from './context/ModelManagement';

export const STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6,
};

export const useScreenToWorld = () => {
  const { camera, size } = useThree();

  return (x, y, depth = 0.5) => {
    const ndc = new Vector3(
      ((x - size.left) / size.width) * 2 - 1,
      -((y - size.top) / size.height) * 2 + 1,
      depth * 2 - 1
    );
    return ndc.unproject(camera);
  };
};

export class PowerOrbitControls extends OrbitControls {
  constructor(object, element = null, orientation = 'horizontal') {
    super(object, element);
    this.orientation = orientation;
  }

  update(deltaTime = null) {
    super.update(deltaTime);
    if (this.autoRotate && this.state === STATE.NONE && this.orientation === 'vertical') {
      this._spherical.phi = this._spherical.phi;
      super._rotateUp(super._getAutoRotationAngle(deltaTime));
    }
  }
}

/**
 *
 * @param {import('@/components/hoc/TheatreManagement').TheatreReturnValue & import('@/components/context/ModelManagement').ModelManagement & { enabled: boolean, makeDefault: boolean, ref: import('react').Ref }} param0
 * @returns
 */
const Orbit = ({ ref, makeDefault, enabled = true, ...rest }) => {
  const { camera, gl, get, set } = useThree();
  const dispatch = useModelDispatch();
  const state = useModelState();
  const { ['Orbit Controls']: OrbitControlsTheatreJS } = rest.theatre;

  /** @type {{ current: PowerOrbitControls }} */
  const controlsRef = useRef();

  // Create and update controls when dependencies change
  useEffect(() => {
    const propsToCheck = [
      'minPolarAngle',
      'maxPolarAngle',
      'minAzimuthAngle',
      'maxAzimuthAngle',
      'enabled',
      'autoRotate',
      'enablePan',
      'enableRotate',
      'enableZoom',
    ];

    // Helper to update properties if different and track changes
    const updateIfDifferent = (oldCtrl, newCtrl, props) => {
      let changed = false;
      props.forEach((prop) => {
        if (oldCtrl[prop] !== newCtrl[prop]) {
          oldCtrl[prop] = newCtrl[prop];
          changed = true;
        }
      });
      return changed;
    };

    // Create new controls instance (but don't set it yet)
    const newControls = new PowerOrbitControls(
      camera,
      gl.domElement,
      OrbitControlsTheatreJS ? OrbitControlsTheatreJS.orientation : 'horizontal'
    );

    // Apply TheatreJS props to newControls
    if (OrbitControlsTheatreJS) {
      if (OrbitControlsTheatreJS.orientation === 'horizontal') {
        newControls.minAzimuthAngle = -Infinity;
        newControls.maxAzimuthAngle = Infinity;
        newControls.minPolarAngle = OrbitControlsTheatreJS.minPolarAngle * DEG2RAD;
        newControls.maxPolarAngle = OrbitControlsTheatreJS.maxPolarAngle * DEG2RAD;
      } else if (OrbitControlsTheatreJS.orientation === 'vertical') {
        newControls.minPolarAngle = -Infinity;
        newControls.maxPolarAngle = Infinity;
        newControls.minAzimuthAngle = 0;
        newControls.maxAzimuthAngle = 0;
      }

      newControls.enabled = enabled;
      newControls.autoRotate = enabled ? OrbitControlsTheatreJS.autoRotate : false;
      newControls.enablePan = OrbitControlsTheatreJS.enablePan;
      newControls.enableRotate = enabled ? OrbitControlsTheatreJS.enableRotate : false;
      newControls.enableZoom = OrbitControlsTheatreJS.enableZoom;

      if (makeDefault) {
        const currentControls = get().controls;
        if (currentControls && currentControls.target) {
          newControls.target.copy(currentControls.target);
        }
      }
    }

    const oldControls = get().controls;

    if (makeDefault && oldControls) {
      // Update old controls with new props if different
      let changed = updateIfDifferent(oldControls, newControls, propsToCheck);

      // Also update target if different
      if (newControls.target && oldControls.target && !newControls.target.equals(oldControls.target)) {
        oldControls.target.copy(newControls.target);
        changed = true;
      }

      if (changed) {
        oldControls.update();
      }

      // Dispose the newControls since we won't use it
      newControls.dispose();

      controlsRef.current = oldControls;
      set({ controls: oldControls });

      // Cleanup: dispose old controls on unmount
      return () => {
        if (oldControls) {
          oldControls.dispose();
          set({ controls: null });
          controlsRef.current = null;
        }
      };
    } else {
      // No old controls or not makeDefault: use newControls directly
      controlsRef.current = newControls;
      set({ controls: newControls });

      // Cleanup: dispose newControls on unmount
      return () => {
        if (controlsRef.current) {
          controlsRef.current.dispose();
          set({ controls: null });
          controlsRef.current = null;
        }
      };
    }
  }, [OrbitControlsTheatreJS, camera, gl.domElement, enabled, makeDefault, get, set]);

  // Update controls every frame
  useFrame(() => {
    if (enabled && controlsRef.current) {
      controlsRef.current.update();

      const getDegreeRotation = Number((controlsRef.current.getAzimuthalAngle() * RAD2DEG).toFixed(0));

      if (state.rotationDegree !== getDegreeRotation) {
        dispatch({
          type: 'rotation',
          value: Math.sign(getDegreeRotation) < 0 ? getDegreeRotation + 360 : getDegreeRotation,
        });

        dispatch({
          type: 'rotation-sign',
          value: Math.sign(getDegreeRotation),
        });
      }
    }
  }, -1);

  useImperativeHandle(ref, () => controlsRef.current, [controlsRef.current]);

  return controlsRef.current ? <primitive ref={ref} object={controlsRef.current} dispose={null} /> : null;
};

const TheatreOrbit = withTheatreManagement(Orbit, 'Orbit Controller', {
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
    options: {
      reconfigure: true,
    },
  },
});

export default TheatreOrbit;
