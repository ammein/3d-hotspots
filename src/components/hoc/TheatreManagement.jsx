import { SheetProvider } from '@theatre/r3f';
import { useApp } from '../context/AppManagement';
import { useEffect, useState, useMemo } from 'react';

/**
 * @typedef {{
 * reconfigure?: boolean;
 * }} TheatreOptions
 */

/**
 * @typedef {{
 * 	props: import('@theatre/core').ISheet['object'];
 * 	options: TheatreOptions;
 * }} TheatreObject
 */

/**
 * Add this type in top of your file, or if commonly used in some types file.
 * @template T
 * @typedef {[T, import('react').Dispatch<import('react').SetStateAction<T>>]} useState
 */

/**
 * @typedef {Record<string, import('@theatre/core').ISheet>} ReferenceState
 */

/**
 * @typedef {Record<string, any>} ReferenceStateAny
 */

/**
 * @typedef {Record<string, TheatreObject>} TheatreOptionsValues
 */

/**
 * @typedef {{ theatre: Record<string, any>, theatreObjects: Record<string, import('@theatre/core').ISheetObject> }} TheatreReturnValue
 */

/**
 * @callback ReferenceStateSetter
 * @param {ReferenceState} state
 * @returns {void}
 */

/**
 * HOC for TheatreJS
 * @param {import('react').JSX} WrappedComponent
 * @param {string} sheetName Name of TheatreJS Sheet
 * @param {TheatreOptionsValues} theatreOptions
 * @returns
 */

/**
 * A higher-order component that adds a `loading` prop to the wrapped component.
 * @template P - The props of the wrapped component.
 * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
 * @param {string} sheetName Name of TheatreJS Sheet
 * @param {TheatreOptionsValues} theatreOptions
 * @returns {function(React.ComponentType): React.ComponentType} A function that takes a React component and returns a new component with model management state.
 */
const withTheatreManagement = (WrappedComponent, sheetName, theatreOptions) => {
  /**
   * The wrapped component with added loading functionality.
   * @template P - The props of the wrapped component.
   * @param {React.ComponentType<P>} WrappedComponent - The component to be wrapped.
   * @returns {React.ComponentType<P & { theatre: TheatreReturnValue }>} The new component with added model management props
   */
  return (props) => {
    const { appProject } = useApp();

    /** @type {[TheatreObject, Function]} */
    const [objects, setObjects] = useState({});

    /** @type {[TheatreOptionsValues, Function]} */
    const [theatreValues, setTheatreValues] = useState({});

    /**
     * Build the sheet once per HOC call
     */
    const sheet = useMemo(() => {
      return appProject.sheet(sheetName);
    }, [sheetName]);

    // Seed objects + initial values
    useEffect(() => {
      if (!appProject.isReady) return;

      const newObjects = {};
      const newValues = {};

      for (const objName in theatreOptions) {
        if (!Object.hasOwn(theatreOptions, objName)) continue;

        const { props, options } = theatreOptions[objName];
        const obj = sheet.object(objName, props, options);

        newObjects[objName] = obj;
        newValues[objName] = obj.value; // seed initial
      }

      setObjects(newObjects);
      setTheatreValues(newValues);

      return () => {
        for (const objName in newObjects) {
          try {
            if (sheet.object(objName)) {
              sheet.detachObject(objName);
            }
          } catch (err) {}
        }
        setObjects({});
      };
    }, [appProject.isReady, theatreOptions, sheet]);

    // Subscribe to changes
    useEffect(() => {
      const unsubCallbacks = [];

      for (const objName in objects) {
        const obj = objects[objName];
        if (!obj) continue;

        const unsub = obj.onValuesChange((val) => {
          setTheatreValues((prev) => ({
            ...prev,
            [objName]: val,
          }));
        });

        unsubCallbacks.push(unsub);
      }

      return () => {
        unsubCallbacks.forEach((fn) => fn());
      };
    }, [objects]);

    return (
      <SheetProvider sheet={sheet}>
        <WrappedComponent {...props} theatre={theatreValues} theatreObjects={objects} />
      </SheetProvider>
    );
  };
};

export default withTheatreManagement;
