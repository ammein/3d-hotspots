import { useThree } from '@react-three/fiber';
import { OrbitControls } from 'three-stdlib';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { useFrame } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useMemo } from 'react';

const Orbit = ({ theatre, rotate, ref }) => {
  const { ['Orbit Controls']: OrbitControlsTheatreJS } = theatre;

  const { camera, gl } = useThree();

  /** @typedef {import('three-extras/controls/OrbitControls').OrbitControls} */
  let myOrbit = useMemo(() => {
    let orbit = new OrbitControls(camera, gl.domElement);
    if (
      OrbitControlsTheatreJS &&
      Object.keys(OrbitControlsTheatreJS).length > 0
    ) {
      orbit.autoRotate = rotate && OrbitControlsTheatreJS.autoRotate;
      orbit.enablePan = OrbitControlsTheatreJS.enablePan;
      orbit.enableRotate = OrbitControlsTheatreJS.enableRotate;
      orbit.enableZoom = OrbitControlsTheatreJS.enableZoom;
    }

    return orbit;
  }, [OrbitControlsTheatreJS, camera, gl, rotate]);

  useFrame(({ gl, scene, camera }) => {
    myOrbit.update();
    gl.render(scene, camera);
  });

  // Reinitialize Orbit Controls so that Orbit Controls does not back to default orientation/position/rotation
  useEffect(() => {
    if (
      OrbitControlsTheatreJS &&
      Object.keys(OrbitControlsTheatreJS).length > 0
    ) {
      myOrbit.dispose();

      myOrbit = new OrbitControls(camera, gl.domElement);
      myOrbit.autoRotate = rotate && OrbitControlsTheatreJS.autoRotate;
      myOrbit.enablePan = OrbitControlsTheatreJS.enablePan;
      myOrbit.enableRotate = OrbitControlsTheatreJS.enableRotate;
      myOrbit.enableZoom = OrbitControlsTheatreJS.enableZoom;
    }

    return () => {
      myOrbit.dispose();
    };
  }, [OrbitControlsTheatreJS, camera, gl, rotate]);

  useImperativeHandle(ref, () => myOrbit, [myOrbit]);
};

const TheatreOrbit = withTheatreManagement(Orbit, 'Model', {
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

export default TheatreOrbit;
