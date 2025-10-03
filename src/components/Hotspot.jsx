import { Center, Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { DassaultText3D } from '@/design-system/components/text3d';
import { useTranslations } from 'use-intl';
import withTheatreManagement from './hoc/TheatreManagement';
import { types } from '@theatre/core';
import { DEG2RAD, RAD2DEG } from '@three-math/MathUtils';
import { getTextScale } from '@/helpers/utils';

/**
 * Hotspot Line component
 * @param { import('@react-three/drei').LineProps & { start: boolean, hotspotName: string, points: Array<Array>, focus: boolean } } 0
 * @returns
 */
const Hotspot = ({ start = false, hotspotName, focus, ...props }) => {
  /** @type {{ current: import('three').Line }} */
  const lineRef = useRef();
  /** @type {{ current: import('@react-three/drei').Text3DProps }} */
  const textRef = useRef();

  const textSizeRef = useRef(0.05);

  const { Text: TextTheatreJS } = props.theatre;

  const initialLookAt = new Vector3()
    .subVectors(
      new Vector3(props.points[2][0], props.points[2][1], props.points[2][2]),
      new Vector3(props.points[1][0], props.points[1][1], props.points[1][2])
    )
    .normalize()
    .add(
      new Vector3(props.points[2][0], props.points[2][1], props.points[2][2])
    );

  const [lookAtDirection, setLookAtDirection] = useState(initialLookAt);

  const t = useTranslations(`Hotspots.${hotspotName}`);

  useFrame(({ camera, gl }) => {
    if (start) {
      if (!lineRef.current.material.visible)
        lineRef.current.material.visible = true;
      const opac = new Vector3(
        props.points[0][0],
        props.points[0][1],
        props.points[0][2]
      ).dot(camera.position);
      lineRef.current.material.opacity = opac;
      if (!focus) {
        textRef.current.lookAt(lookAtDirection);
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

      textSizeRef.current = textSize;
    }
  });

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
      <Line ref={lineRef} {...props} />
      <Center
        right
        position={
          new Vector3(
            props.points[2][0],
            props.points[2][1],
            props.points[2][2]
          )
        }
      >
        <DassaultText3D
          ref={textRef}
          size={textSizeRef.current}
          weight="bold"
          height={0.04}
        >
          {t('label')}
          <meshStandardMaterial color="black" />
        </DassaultText3D>
      </Center>
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
    },
  },
});

export default HotspotTheatreJS;
