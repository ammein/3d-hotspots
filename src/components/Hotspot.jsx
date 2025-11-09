import { useFrame, useThree, extend } from '@react-three/fiber';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Color, Vector3 } from 'three';
import { DassaultText3D } from '@/design-system/components/3DText';
import { useTranslations } from 'use-intl';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';
import { getTextScale, stableLookAt } from '@/helpers/utils';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline';
import { useApp } from '@/components/context/AppManagement';
import Detail from './scenes/detail';

extend({ MeshLineGeometry, MeshLineMaterial });

/**
 * @typedef {Object} Hotspot
 * @property {typeof MeshLineMaterial} material
 * @property {typeof MeshLineGeometry} geometry
 * @property {boolean} start
 * @property {string} hotspotName
 * @property {string} id
 * @property {boolean} focus
 * @property {Function} onClose
 */

/**
 * Hotspot Line component
 * @param { Hotspot & import('@/components/context/ModelManagement').ModelManagement & import('@/components/hoc/TheatreManagement').TheatreReturnValue } 0
 * @returns
 */
const Hotspot = ({ geometry, material, start = false, hotspotName, id, focus, ...props }) => {
  /** @type {{ current: import('three').Mesh<MeshLineGeometry, MeshLineMaterial> }} */
  const lineRef = useRef();

  /** @type {{ current: import('@react-three/drei').Text3DProps }} */
  const textRef = useRef();

  const textSizeRef = useRef(0.05);

  const { Text: TextTheatreJS } = props.theatre;

  const { metadata } = useApp();

  /** @type {import('@react-three/fiber').RootState & { controls: import('@/components/Orbit').PowerOrbitControls }} */
  const { camera, gl } = useThree();

  const initialLookAt = new Vector3()
    .subVectors(
      new Vector3(geometry.points[2].x, geometry.points[2].y, geometry.points[2].z),
      new Vector3(geometry.points[1].x, geometry.points[1].y, geometry.points[1].z)
    )
    .normalize()
    .add(new Vector3(geometry.points[2].x, geometry.points[2].y, geometry.points[2].z));

  const link = useMemo(() => {
    const getLink = metadata.screens.detail.hotspots.find((val) => val.name === hotspotName);

    if (getLink) {
      if (getLink['link']) {
        return getLink['link'];
      }
      return null;
    }

    return null;
  }, [hotspotName, metadata.screens.detail.hotspots]);

  const [lookAtDirection, setLookAtDirection] = useState(initialLookAt);

  const [hidden, setHidden] = useState(true);

  const t = useTranslations(`Hotspots.${hotspotName}`);

  useFrame(({ camera, gl }) => {
    if (start && textRef.current) {
      if (!lineRef.current.material.visible) lineRef.current.material.visible = true;
      if (!focus && id.length === 0) {
        const opac = new Vector3(geometry.points[0].x, geometry.points[0].y, geometry.points[0].z).dot(camera.position);
        lineRef.current.material.opacity = opac;
        textRef.current.position.set(geometry.points[2].x, geometry.points[2].y, geometry.points[2].z);
        textRef.current.lookAt(lookAtDirection);

        const progressCamera = gsap.utils.clamp(0, 1, opac);

        const lineMiddle = gsap.utils.interpolate(geometry.points[0], geometry.points[1], progressCamera);
        const lineText = gsap.utils.interpolate(geometry.points[1], geometry.points[2], progressCamera);

        lineRef.current.geometry.setPoints([
          geometry.points[0],
          new Vector3(lineMiddle.x, lineMiddle.y, lineMiddle.z),
          new Vector3(lineText.x, lineText.y, lineText.z),
        ]);

        textRef.current.material.opacity = gsap.utils.clamp(0, 1, opac);
      } else if (focus && id.length > 0) {
        stableLookAt(textRef.current, camera.position);
        // textRef.current.lookAt(camera.position);
      } else if (!focus && id !== hotspotName && id.length > 0) {
        lineRef.current.material.opacity = 0;
        textRef.current.material.opacity = 0;
      }
    } else {
      lineRef.current.material.visible = false;
    }

    if (lineRef.current && TextTheatreJS) {
      // Text Scale
      const worldPos = lineRef.current.getWorldPosition(new Vector3());

      const textSize = getTextScale(worldPos, camera, gl, TextTheatreJS.size);

      if (!focus) {
        textSizeRef.current = textSize;
      }
    }
  });

  useGSAP(
    () => {
      if (focus && TextTheatreJS) {
        const textSize = getTextScale(
          lineRef.current.getWorldPosition(new Vector3()),
          camera,
          gl,
          TextTheatreJS.focusSize
        );

        const lineAnimate = gsap.to(
          {},
          {
            onUpdate: () => {
              const progress = lineAnimate.progress();

              const size = gsap.utils.interpolate(textSizeRef.current, textSize, progress);
              textSizeRef.current = size;
            },
            onComplete: () => {
              setHidden(false);
            },
            duration: 0.5,
          }
        );
      } else {
        setHidden(true);
      }
    },
    {
      dependencies: [focus, camera, gl],
    }
  );

  // Update States and Live Props Changes
  useEffect(() => {
    if (TextTheatreJS && !focus) {
      setLookAtDirection((prev) =>
        prev.clone().applyAxisAngle(new Vector3(0, 1, 0), TextTheatreJS.direction * DEG2RAD)
      );
    } else if (TextTheatreJS && !hidden && focus) {
      if (textSizeRef.current !== TextTheatreJS.focusSize) {
        const textSize = getTextScale(
          lineRef.current.getWorldPosition(new Vector3()),
          camera,
          gl,
          TextTheatreJS.focusSize
        );
        textSizeRef.current = textSize;
      }
    }
  }, [TextTheatreJS, camera, focus, gl, hidden]);

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
            // eslint-disable-next-line react-hooks/refs
            size={textSizeRef.current}
            weight={TextTheatreJS.weight}
            height={TextTheatreJS.thickness}
          >
            {t('label')}
            <meshPhysicalMaterial
              color={new Color()
                .setRGB(TextTheatreJS.color.r, TextTheatreJS.color.g, TextTheatreJS.color.b)
                .convertSRGBToLinear()}
              transparent
            />
            <Detail link={link} hotspotName={hotspotName} hidden={hidden} onClose={props.onClose} />
          </DassaultText3D>
        </>
      )}
    </>
  );
};

const HotspotTheatreJS = withTheatreManagement(Hotspot, 'Text Hotspot', {
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
      size: types.number(14.742, {
        range: [1, 100],
      }),
      focusSize: types.number(33.57, {
        range: [1, 100],
      }),
    },
    options: {
      reconfigure: true,
    },
  },
});

export default HotspotTheatreJS;
