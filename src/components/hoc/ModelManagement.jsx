import { useState } from 'react';

/**
 * @callback ModelCallback
 * @param {"mode" | "hotspot" | "rotation"} type
 * @param {any} value
 * @returns {void}
 */

/**
 * @typedef {Object} ModelManagement
 * @property {boolean} wireframe
 * @property {boolean} hotspotID
 * @property {number} rotationDegree
 * @property {ModelCallback} modelCallback
 * @returns
 */

/**
 * A higher-order component that adds a `loading` prop to the wrapped component.
 * @template P - The props of the wrapped component.
 * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
 * @returns {function(React.ComponentType): React.ComponentType} A function that takes a React component and returns a new component with model management state.
 */
const withModelManagement = (WrappedComponent) => {
  /**
   * The wrapped component with added loading functionality.
   * @template P - The props of the wrapped component.
   * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
   * @returns {React.ComponentType<P & ModelManagement>} The new component with added model management props
   */
  return (props) => {
    const [wireframe, setWireframe] = useState(false);
    const [hotspotID, setHotspotID] = useState('');
    const [rotationDegree, setRotationDegree] = useState(0);

    /**
     * @type {ModelCallback} modelCallback
     */
    const callback = (type, value) => {
      switch (type) {
        case 'mode':
          setWireframe(Boolean(value));
          break;

        case 'hotspot':
          setHotspotID(value);
          break;

        case 'rotation':
          setRotationDegree(Number(value));
          break;

        default:
          throw new Error(
            'You did not set any valid type for updating state. \nType supported:\n1. mode\n2. hotspot\n3. rotation'
          );
      }
    };

    return (
      <WrappedComponent
        wireframe={wireframe}
        hotspotID={hotspotID}
        rotationDegree={rotationDegree}
        modelCallback={callback}
        {...props}
      />
    );
  };
};

export default withModelManagement;
