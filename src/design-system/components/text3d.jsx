import { Text3D } from '@react-three/drei';

const fontPath = '/fonts/json/';

/**
 * @typedef {Object} DassaultText3DProps
 * @property {'light' | 'light-italic' | 'regular' | 'italic' | 'semibold' | 'semibold-italic' | 'bold' | 'bold-italic'} weight
 * @property {import('react').Ref} ref
 */

/**
 * Dassault Text 3D Component
 * @param {DassaultText3DProps & import('@react-three/drei').Text3DProps} param0
 */
const DassaultText3D = ({ children, weight, ref, ...rest }) => {
  let fontUrl;

  switch (weight) {
    case 'light':
      fontUrl = fontPath + '3DSV2-Light.json';
      break;

    case 'light-italic':
      fontUrl = fontPath + '3DSV2-LightItalic.json';
      break;

    case 'regular':
      fontUrl = fontPath + '3DSV2-Regular.json';
      break;

    case 'italic':
      fontUrl = fontPath + '3DSV2-Italic.json';
      break;

    case 'semibold':
      fontUrl = fontPath + '3DSV2-SemiBold.json';
      break;

    case 'semibold-italic':
      fontUrl = fontPath + '3DSV2-SemiBoldItalic.json';
      break;

    case 'bold':
      fontUrl = fontPath + '3DSV2-Bold.json';
      break;

    case 'bold-italic':
      fontUrl = fontPath + '3DSV2-BoldItalic.json';
  }

  return (
    <Text3D ref={ref} font={fontUrl} {...rest}>
      {children}
    </Text3D>
  );
};

DassaultText3D.displayName = 'Dassault Text 3D';

export { DassaultText3D };
