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

const withModelManagement = (WrappedComponent) => {
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
