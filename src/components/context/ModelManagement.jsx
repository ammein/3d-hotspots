/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';

/**
 * @typedef {Object} ModelManagement
 * @property {boolean} wireframe
 * @property {boolean} hotspotID
 * @property {Array<import('@/components/Model').Hotspots>} hotspotData
 * @property {number} rotationDegree
 * @property {number} rotationSign
 * @property {ModelCallback} modelCallback
 * @returns
 */

/**
 * @typedef {Object} ModelType
 * @property {"wireframe" | "hotspot" | "rotation" | "hotspot-data" | "rotation-sign"} type
 */

/**
 * @typedef {Object} ModelValue
 * @property {any} value
 */

/**
 * @callback ModelCallback
 * @param {ModelType & ModelValue} 0
 * @returns {void}
 */

/**
 * @typedef {Object} ModelState
 * @property {boolean} wireframe
 * @property {string} hotspotID
 * @property {Array<import('@/components/Model').Hotspots>} hotspotData
 * @property {number} rotationDegree
 * @property {number} rotationSign
 */

export const StateContext = createContext(null);
export const DispatchContext = createContext(null);

/** @type {ModelState} */
const initialModelState = {
  wireframe: false,
  hotspotID: '',
  hotspotData: [],
  rotationDegree: 0,
  rotationSign: 0,
};

/**
 * @function ReducerModelManagement
 * @param {ModelType} state
 * @param {ModelValue} action
 * @returns {ModelState}
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'wireframe':
      return { ...state, wireframe: action.value };

    case 'hotspot':
      return { ...state, hotspotID: action.value };

    case 'rotation':
      return { ...state, rotationDegree: action.value };

    case 'rotation-sign':
      return { ...state, rotationSign: action.value };

    case 'hotspot-data':
      return { ...state, hotspotData: action.value };

    default:
      throw new Error(
        'You did not set any valid type for updating state. \nType supported:' +
          ['wireframe', 'hotspot', 'rotation', 'hotspot-data', 'rotation-sign']
            .map((val, i) => '\n' + (i + 1) + '. ' + val)
            .join(' ')
      );
  }
};

/**
 * A higher-order component that adds a `loading` prop to the wrapped component.
 * @template P - The props of the wrapped component.
 * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
 * @returns {function(React.ComponentType): React.ComponentType} A function that takes a React component and returns a new component with model management state.
 */
const ModelManagement = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialModelState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

/**
 * @returns {function(React.ComponentType): React.ComponentType}
 */
export default ModelManagement;

/**
 * @returns {ModelManagement}
 */
export const useModelState = () => useContext(StateContext);

/**
 * @returns {ModelCallback}
 */
export const useModelDispatch = () => useContext(DispatchContext);
