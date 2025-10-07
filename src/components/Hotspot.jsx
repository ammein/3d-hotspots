import { useFrame, useThree, extend } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Color, Vector2, Vector3 } from 'three';
import { DassaultText3D } from '@/design-system/components/text3d';
import { useTranslations } from 'use-intl';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';
import { getTextScale, worldToScreen } from '@/helpers/utils';
import withModelManagement from '@/components/hoc/ModelManagement';
import { useScreenToWorld } from '@/components/Orbit';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import { Html } from '@react-three/drei';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * @typedef {Object} Hotspot
 * @property {typeof MeshLineMaterial} material
 * @property {typeof MeshLineGeometry} geometry
 * @property {boolean} start
 * @property {string} hotspotName
 * @property {boolean} focus
 */

/**
 * Hotspot Line component
 * @param { Hotspot & import('@/components/hoc/ModelManagement').ModelManagement & import('@/components/hoc/TheatreManagement').TheatreReturnValue } 0
 * @returns
 */
const Hotspot = ({
  geometry,
  material,
  start = false,
  hotspotName,
  focus,
  ...props
}) => {
  /** @type {{ current: import('three').Mesh<MeshLineGeometry, MeshLineMaterial> }} */
  const lineRef = useRef();

  /** @type {{ current: import('@react-three/drei').Text3DProps }} */
  const textRef = useRef();

  const htmlRef = useRef();

  const textSizeRef = useRef(0.05);

  const { Text: TextTheatreJS } = props.theatre;

  const screenToWorld = useScreenToWorld();

  /** @type {import('@react-three/fiber').RootState & { controls: import('@/components/Orbit').PowerOrbitControls }} */
  const { camera, gl, controls } = useThree();

  const initialLookAt = new Vector3()
    .subVectors(
      new Vector3(
        geometry.points[2].x,
        geometry.points[2].y,
        geometry.points[2].z
      ),
      new Vector3(
        geometry.points[1].x,
        geometry.points[1].y,
        geometry.points[1].z
      )
    )
    .normalize()
    .add(
      new Vector3(
        geometry.points[2].x,
        geometry.points[2].y,
        geometry.points[2].z
      )
    );

  const [lookAtDirection, setLookAtDirection] = useState(initialLookAt);

  const [hidden, setHidden] = useState(true);

  const t = useTranslations(`Hotspots.${hotspotName}`);

  /**
   *
   * @param {import('three').Object3D} el
   * @param {import('three').Camera} camera
   * @param {{ width: number, height: number }} size
   * @returns {number[]}
   */
  // const calculateHTMLPosition = (el, camera, size) => {
  //   if (focus) {
  //     const screenPos = worldToScreen(
  //       textRef.current.getWorldPosition(new Vector3()),
  //       camera,
  //       gl
  //     );

  //     return screenPos;
  //   }
  // };

  /**
   * Line To Center Viewport
   * @param {number} x - Percentage Width [0-1]: 0 is 0% while 100 is 100% width
   * @param {number} y - Percentage Height [0-1]: 0 is 0% while 100 is 100% height
   * @param {import('three').Object3D} obj
   * @param {import('three').Camera} camera
   * @param {import('three').WebGLRenderer} gl
   * @param {import('@/components/Orbit').PowerOrbitControls | null} lookAtTarget
   */
  const moveToViewport = (x, y, obj, camera, gl, lookAtTarget = null) => {
    const hotspotWorld = obj.getWorldPosition(new Vector3());

    // --- CASE B: use camera lookAt target if provided ---
    if (lookAtTarget) {
      return lookAtTarget.clone().sub(hotspotWorld);
    }

    // --- CASE A: otherwise, use literal screen center ---

    // Project hotspot into screen space
    const hotspotScreen = hotspotWorld.clone().project(camera);

    // Convert to pixel coordinates
    const width = gl.domElement.width;
    const height = gl.domElement.height;
    const hotspotPx = new Vector2(
      (hotspotScreen.x + 1) * 0.0 * width,
      (1 - hotspotScreen.y) * 0.0 * height
    );

    // Screen center in pixels
    const centerPx = new Vector2(width * x, height * y);

    // Get depth of hotspot in [0,1] range
    const depth = (hotspotScreen.z + 1) / 2;

    const hotspotW = screenToWorld(hotspotPx.x, hotspotPx.y, depth);
    const centerW = screenToWorld(centerPx.x, centerPx.y, depth);

    // Vector from hotspot → center
    return centerW.sub(hotspotW);
  };

  useFrame(({ camera, gl }) => {
    if (start && textRef.current) {
      if (!lineRef.current.material.visible)
        lineRef.current.material.visible = true;
      if (!focus) {
        const opac = new Vector3(
          geometry.points[0].x,
          geometry.points[0].y,
          geometry.points[0].z
        ).dot(camera.position);
        lineRef.current.material.opacity = opac;
        textRef.current.position.set(
          geometry.points[2].x,
          geometry.points[2].y,
          geometry.points[2].z
        );
        textRef.current.lookAt(lookAtDirection);

        let progressCamera = gsap.utils.clamp(0, 1, opac);

        const lineMiddle = gsap.utils.interpolate(
          geometry.points[0],
          geometry.points[1],
          progressCamera
        );
        const lineText = gsap.utils.interpolate(
          geometry.points[1],
          geometry.points[2],
          progressCamera
        );

        lineRef.current.geometry.setPoints([
          geometry.points[0],
          new Vector3(lineMiddle.x, lineMiddle.y, lineMiddle.z),
          new Vector3(lineText.x, lineText.y, lineText.z),
          ,
        ]);

        textRef.current.material.opacity = gsap.utils.clamp(0, 1, opac);
      } else if (focus) {
        textRef.current.lookAt(camera.position);
      }
    } else {
      lineRef.current.material.visible = false;
    }

    if (lineRef.current) {
      // Text Scale
      const worldPos = lineRef.current.getWorldPosition(new Vector3());

      const textSize = getTextScale(worldPos, camera, gl, 14.742);

      if (!focus) {
        textSizeRef.current = textSize;
      }
    }
  });

  useGSAP(
    () => {
      if (focus) {
        const newPoints = moveToViewport(
          0.2,
          0.2,
          lineRef.current,
          camera,
          gl,
          controls.target
        );

        const textSize = getTextScale(
          lineRef.current.getWorldPosition(new Vector3()),
          camera,
          gl,
          33.57
        );

        const lineAnimate = gsap.to(
          {},
          {
            onUpdate: () => {
              const progress = lineAnimate.progress();
              const look = gsap.utils.interpolate(
                new Vector3(
                  geometry.points[2].x,
                  geometry.points[2].y,
                  geometry.points[2].z
                ),
                newPoints,
                progress
              );

              const size = gsap.utils.interpolate(
                textSizeRef.current,
                textSize,
                progress
              );

              // Move Line to Text
              lineRef.current.geometry.setPoints([
                geometry.points[0],
                geometry.points[2],
                new Vector3(look.x, look.y, look.z),
              ]);

              textRef.current.position.set(look.x, look.y, look.z);
              textSizeRef.current = size;
            },
            onComplete: () => {
              setHidden(false);
            },
            duration: 0.5,
          }
        );
      }
    },
    {
      dependencies: [focus, camera, gl],
    }
  );

  useEffect(() => {
    if (TextTheatreJS && !focus) {
      setLookAtDirection((prev) => {
        let final = initialLookAt
          .clone()
          .applyAxisAngle(
            new Vector3(0, 1, 0),
            TextTheatreJS.direction * DEG2RAD
          );

        return final;
      });
    }
  }, [TextTheatreJS]);

  return (
    <>
      <group dispose={null}>
        <mesh ref={lineRef} raycast={raycast}>
          <meshLineGeometry {...geometry} />
          <meshLineMaterial {...material} />
        </mesh>
      </group>
      {TextTheatreJS && (
        <>
          <DassaultText3D
            ref={textRef}
            size={textSizeRef.current}
            weight={TextTheatreJS.weight}
            height={TextTheatreJS.thickness}
          >
            {t('label')}
            <meshPhysicalMaterial
              color={new Color().setRGB(
                TextTheatreJS.color.r,
                TextTheatreJS.color.g,
                TextTheatreJS.color.b
              )}
              transparent
            />
          </DassaultText3D>
          <Html
            ref={htmlRef}
            as="div"
            occlude
            onOcclude={setHidden}
            style={{
              display: hidden ? 'none' : 'block',
            }}
          >
            {t('description')}
          </Html>
        </>
      )}
    </>
  );
};

const HotspotTheatreJS = withTheatreManagement(Hotspot, 'Text', {
  Text: {
    props: {
      direction: types.number(2 * Math.PI * RAD2DEG, {
        range: [0, 2 * Math.PI * RAD2DEG],
        label: 'Rotate',
        nudgeMultiplier: 1,
      }),
      thickness: types.number(0.02, {
        range: [0, 1],
        nudgeMultiplier: 0.01,
        label: 'Thickness',
      }),
      weight: types.stringLiteral(
        'bold',
        {
          light: 'Light',
          'light-italic': 'Light Italic',
          regular: 'Regular',
          italic: 'Italic',
          semibold: 'Semibold',
          'semibold-italic': 'Semibold Italic',
          bold: 'Bold',
          'bold-italic': 'Bold Italic',
        },
        {
          label: 'Font Weight',
        }
      ),
      color: types.rgba(
        {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        {
          label: 'Line Color',
        }
      ),
    },
  },
});

const HotspotManagement = withModelManagement(HotspotTheatreJS);

export default HotspotManagement;
