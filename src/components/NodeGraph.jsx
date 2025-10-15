import { useGSAP } from '@gsap/react';
import { Sphere } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import { memo, useRef } from 'react';
import { MeshBasicMaterial, SphereGeometry } from 'three';
import gsap from 'gsap';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * @typedef {Object} TheatreJSOpac
 * @property {number} behind
 * @property {number} front
 */

/**
 * @typedef {Object} NodeGraph
 * @property {string} name
 * @property {string} active
 * @property {MeshLineMaterial} material
 * @property {MeshLineGeometry} geometry
 * @property {import('three').Color} pointColor
 * @property {number} pointSize
 * @property {import('three').Color} activeColor
 * @property {TheatreJSOpac} lineOpac
 * @property {TheatreJSOpac} sphereOpac
 * @property {TheatreJSOpac} dashArray
 * @property {TheatreJSOpac} dashOffset
 * @property {TheatreJSOpac} dashRatio
 */

/**
 * Node Graph Component
 * @param {NodeGraph} param0
 * @returns
 */
const NodeGraph = ({
  name,
  geometry,
  active,
  material,
  pointColor,
  pointSize,
  activeColor,
  lineOpac,
  sphereOpac,
  dashArray,
  dashOffset,
  dashRatio,
}) => {
  /** @type {import('react').Ref<import('three').Mesh<MeshLineGeometry, MeshLineMaterial>>} */
  const lineRef = useRef();

  /** @type {import('react').Ref<import('three').Mesh<SphereGeometry, MeshBasicMaterial>>} */
  const sphereRef = useRef();

  useGSAP(() => {
    if (active.length > 0 && active === name) {
      gsap.to(lineRef.current.material.color, {
        r: activeColor.r,
        g: activeColor.g,
        b: activeColor.b,
        duration: 0.5,
      });
      gsap.to(sphereRef.current.material.color, {
        r: activeColor.r,
        g: activeColor.g,
        b: activeColor.b,
        duration: 0.5,
      });
    }
  }, [active]);

  useFrame(({ camera }) => {
    if (camera) {
      const frontFacing = geometry.points[1].clone().dot(camera.position);

      // For Inactive Status
      if (active.length === 0) {
        if (frontFacing <= 0) {
          lineRef.current.material.opacity = lineOpac.behind;
          sphereRef.current.material.opacity = sphereOpac.behind;
          lineRef.current.material.dashArray = dashArray.behind;
          lineRef.current.material.dashOffset = dashOffset.behind;
          lineRef.current.material.dashRatio = dashRatio.behind;
        } else {
          lineRef.current.material.opacity = lineOpac.front;
          sphereRef.current.material.opacity = sphereOpac.front;
          lineRef.current.material.dashArray = dashArray.front;
          lineRef.current.material.dashOffset = dashOffset.front;
          lineRef.current.material.dashRatio = dashRatio.front;
        }
      }
      // For Active Status & Match ID
      else if (active.length && active === name) {
        lineRef.current.material.opacity = lineOpac.front;
        sphereRef.current.material.opacity = sphereOpac.front;
        lineRef.current.material.dashArray = dashArray.front;
        lineRef.current.material.dashOffset = dashOffset.front;
        lineRef.current.material.dashRatio = dashRatio.front;
      }
      // For Active Status & Non-match ID
      else {
        lineRef.current.material.opacity = lineOpac.behind;
        sphereRef.current.material.opacity = sphereOpac.behind;
        lineRef.current.material.dashArray = dashArray.behind;
        lineRef.current.material.dashOffset = dashOffset.behind;
        lineRef.current.material.dashRatio = dashRatio.behind;
      }
    }
  });

  return (
    <>
      <group key={name}>
        <group dispose={null}>
          <mesh ref={lineRef} raycast={raycast}>
            <meshLineGeometry {...geometry} />
            <meshLineMaterial {...material} />
          </mesh>
        </group>
        <Sphere ref={sphereRef} position={geometry.points[1].subScalar(0.2)} args={[pointSize]}>
          <meshBasicMaterial color={pointColor} transparent />
        </Sphere>
      </group>
    </>
  );
};

/**
 * Node Graph Component
 * @param {import('react').NamedExoticComponent<NodeGraph>} 0
 * @returns
 */
export default memo(NodeGraph);
