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
    let myOrbit = new OrbitControls(camera, gl.domElement);
    if (
      OrbitControlsTheatreJS &&
      Object.keys(OrbitControlsTheatreJS).length > 0
    ) {
      if (OrbitControlsTheatreJS.horizontalOnly) {
        camera.up.set(0, 1, 0);
        myOrbit.minPolarAngle = Math.PI / 2;
        myOrbit.maxPolarAngle = Math.PI / 2;
      } else if (OrbitControlsTheatreJS.verticalOnly) {
        camera.up.set(1, 0, 0);
        myOrbit.minPolarAngle = 0;
        myOrbit.maxPolarAngle = Math.PI;
        myOrbit.minAzimuthAngle = 0;
        myOrbit.maxAzimuthAngle = 0;
      }
      myOrbit.autoRotate = rotate && OrbitControlsTheatreJS.autoRotate;
      myOrbit.enablePan = OrbitControlsTheatreJS.enablePan;
      myOrbit.enableRotate = OrbitControlsTheatreJS.enableRotate;
      myOrbit.enableZoom = OrbitControlsTheatreJS.enableZoom;
    }

    return myOrbit;
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
      if (OrbitControlsTheatreJS.horizontalOnly) {
        camera.up.set(0, 1, 0);
        myOrbit.minPolarAngle = Math.PI / 2;
        myOrbit.maxPolarAngle = Math.PI / 2;
      } else if (OrbitControlsTheatreJS.verticalOnly) {
        camera.up.set(1, 0, 0);
        myOrbit.minPolarAngle = 0;
        myOrbit.maxPolarAngle = Math.PI;
        myOrbit.minAzimuthAngle = 0;
        myOrbit.maxAzimuthAngle = 0;
      }

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
      maxPolarAngle: types.number(Math.PI, {
        range: [0, Math.PI],
      }),
      minPolarAngle: types.number(0, {
        range: [0, Math.PI],
      }),
      horizontalOnly: types.boolean(false),
      verticalOnly: types.boolean(false),
    },
  },
});

export default TheatreOrbit;
