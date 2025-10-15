import { useGSAP } from '@gsap/react';
import { Sphere } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import { memo, useRef } from 'react';
import { Color, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';
import { useModelState } from './context/ModelManagement';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * @typedef {Object} NodeGraph
 * @property {string} name
 * @property {string} active
 * @property {MeshLineMaterial} material
 * @property {MeshLineGeometry} geometry
 */

/**
 * Node Graph Component
 * @param {NodeGraph} 0
 * @returns
 */
const NodeGraph = memo(({ name, geometry, active, material }) => {
  /** @type {import('react').Ref<import('three').Mesh<MeshLineGeometry, MeshLineMaterial>>} */
  const lineRef = useRef();

  /** @type {import('react').Ref<import('three').Mesh<SphereGeometry, MeshBasicMaterial>>} */
  const sphereRef = useRef();

  useGSAP(() => {
    if (active.length > 0 && active === name) {
      lineRef.current.material.color = new Color('blue');
      sphereRef.current.material.color = new Color('blue');
    }
  }, [active]);

  return (
    <>
      <group key={name}>
        <group dispose={null}>
          <mesh ref={lineRef} raycast={raycast}>
            <meshLineGeometry {...geometry} />
            <meshLineMaterial {...material} />
          </mesh>
        </group>
        <Sphere ref={sphereRef} position={geometry.points[1].subScalar(0.2)} args={[0.1]}>
          <meshBasicMaterial color={new Color('black')} />
        </Sphere>
      </group>
    </>
  );
});

export default NodeGraph;
