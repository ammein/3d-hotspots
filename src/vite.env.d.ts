/// <reference types="vite/client" />

/**
 * For Custom svg that needs to render as react component
 * @example
 * import PlaySVG from '@/design-system/icons/play-big.svg?react'
 */
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}