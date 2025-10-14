import { useThrottle } from '@uidotdev/usehooks';
import { createContext, useContext, useReducer } from 'react';

/**
 * @typedef {Object} ModelManagement
 * @property {boolean} wireframe
 * @property {boolean} hotspotID
 * @property {number} rotationDegree
 * @property {ModelCallback} modelCallback
 * @returns
 */

/**
 * @typedef {Object} ModelType
 * @property {"wireframe" | "hotspot" | "rotation"} type
 */

/**
 * @callback ModelCallback
 * @param {ModelManagement & ModelType} 0
 * @returns {void}
 */

export const StateContext = createContext(null);
export const DispatchContext = createContext(null);

const initialModelState = {
  wireframe: false,
  hotspotID: '',
  rotationDegree: 0,
};

/**
 * @function ReducerModelManagement
 * @param {ModelType} state
 * @param {any} action
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'wireframe':
      return { ...state, wireframe: action.wireframe };

    case 'hotspot':
      return { ...state, hotspotID: action.hotspotID };

    case 'rotation':
      return { ...state, rotationDegree: action.rotationDegree };

    default:
      throw new Error(
        'You did not set any valid type for updating state. \nType supported:\n1. mode\n2. hotspot\n3. rotation'
      );
  }
};

/**
 * A higher-order component that adds a `loading` prop to the wrapped component.
 * @template P - The props of the wrapped component.
 * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
 * @returns {function(React.ComponentType): React.ComponentType} A function that takes a React component and returns a new component with model management state.
 */
export default ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialModelState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

/**
 * @returns {ModelManagement}
 */
export const useModelState = () => useContext(StateContext);

/**
 * @returns {ModelCallback}
 */
export const useModelDispatch = () => useContext(DispatchContext);
