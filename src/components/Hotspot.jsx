import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3 } from 'three';

/**
 * Hotspot Line component
 * @param { import('@react-three/drei').LineProps } 0
 * @returns
 */
const Hotspot = ({ ...props }) => {
  /** @type {{ current: import('three').Line }} */
  const lineRef = useRef();

  useFrame(({ camera }) => {
    const opac = new Vector3(
      props.points[0][0],
      props.points[0][1],
      props.points[0][2]
    ).dot(camera.position);
    lineRef.current.material.opacity = opac;
  });

  return <Line ref={lineRef} {...props} />;
};

export default Hotspot;
