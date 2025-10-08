import { useFrame, useThree, extend } from '@react-three/fiber';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Color, Vector3 } from 'three';
import { DassaultText3D } from '@/design-system/components/text3d';
import { useTranslations } from 'use-intl';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';
import {
  getDepthFromObject,
  getTextScale,
  stableLookAt,
} from '@/helpers/utils';
import withModelManagement from '@/components/hoc/ModelManagement';
import { useScreenToWorld } from '@/components/Orbit';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import { Html } from '@react-three/drei';
import { useMediaQuery } from 'react-responsive';

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

  const [textBoundingBox, setTextBoundingBox] = useState(null);

  /** @type {import('@react-three/fiber').RootState & { controls: import('@/components/Orbit').PowerOrbitControls }} */
  const { camera, gl, controls } = useThree();

  const isDesktop = useMediaQuery({
    minWidth: '1280px',
  });

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

  const widthText = () => {
    if (isDesktop) {
      htmlRef.current.style.width = '327.907px';
    }
  };

  const [lookAtDirection, setLookAtDirection] = useState(initialLookAt);

  const [hidden, setHidden] = useState(true);

  const t = useTranslations(`Hotspots.${hotspotName}`);

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
    const depth = getDepthFromObject(obj, camera);

    const centerW = screenToWorld(
      x * gl.domElement.width,
      y * gl.domElement.height,
      depth
    );

    // Vector from hotspot → center
    return centerW;
  };

  useFrame(({ camera, gl, controls }) => {
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
        stableLookAt(textRef.current, camera.position);
        // textRef.current.lookAt(camera.position);
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
        const textSize = getTextScale(
          lineRef.current.getWorldPosition(new Vector3()),
          camera,
          gl,
          33.57
        );

        widthText();

        const lineAnimate = gsap.to(
          {},
          {
            onUpdate: () => {
              const progress = lineAnimate.progress();

              const size = gsap.utils.interpolate(
                textSizeRef.current,
                textSize,
                progress
              );
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
            <Html
              ref={htmlRef}
              as="div"
              style={{
                padding: '5px 0 5px 5px',
                display: hidden ? 'none' : 'block',
                backgroundColor: 'var(--color-white-48)',
              }}
            >
              <p>{t('description')}</p>
            </Html>
          </DassaultText3D>
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
