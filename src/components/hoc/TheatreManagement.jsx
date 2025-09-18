import { SheetProvider } from "@theatre/r3f";
import { useApp } from "../context/AppManagement";
import { useEffect, useState, useMemo, useCallback } from "react";

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
const withTheatreManagement = (WrappedComponent, sheetName, theatreOptions) => {
  return (props) => {
    const { appProject } = useApp();

    /** @type {[TheatreObjects, Function]} */
    const [objects, setObjects] = useState({});

    /** @type {[TheatreValues, Function]} */
    const [theatreValues, setTheatreValues] = useState({});

    /**
     * Build the sheet once per HOC call
     */
    const sheet = useMemo(() => {
      return appProject.sheet(sheetName);
    }, [theatreOptions, appProject]);

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
        newValues[objName] = obj.value; // ✅ seed initial
      }

      setObjects(newObjects);
      setTheatreValues(newValues);

      return () => {
        for (const objName in newObjects) {
          sheet.detachObject(objName);
        }
        setObjects({});
      };
    }, [appProject, theatreOptions, sheet]);

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
        <WrappedComponent {...props} theatre={theatreValues} />
      </SheetProvider>
    );
  };
};

export default withTheatreManagement;
