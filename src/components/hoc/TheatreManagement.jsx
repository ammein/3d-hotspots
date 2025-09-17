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
 * @typedef {Record<string, Record<string, TheatreObject>>} TheatreOptionsValues
 */

/**
 * @callback ReferenceStateSetter
 * @param {ReferenceState} state
 * @returns {void}
 */

/**
 *
 * @param {import('react').JSX} WrappedComponent
 * @param {TheatreOptionsValues} theatreOptions
 * @returns
 */
const withTheatreManagement = (WrappedComponent, theatreOptions) => {
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
			const firstKey = Object.keys(theatreOptions)[0];
			return appProject.sheet(firstKey);
		}, [theatreOptions, appProject]);

		// Seed objects + initial values
		useEffect(() => {
			if (!appProject.isReady) return;

			const newObjects = {};
			const newValues = {};

			for (const sheetName in theatreOptions) {
				const sheetObjects = theatreOptions[sheetName];
				newObjects[sheetName] = {};
				newValues[sheetName] = {};

				for (const objName in sheetObjects) {
					if (!Object.hasOwn(sheetObjects, objName)) continue;

					const { props, options } = sheetObjects[objName];
					const obj = sheet.object(objName, props, options);

					newObjects[sheetName][objName] = obj;
					newValues[sheetName][objName] = obj.value; // ✅ seed initial
				}
			}

			setObjects(newObjects);
			setTheatreValues(newValues);

			return () => {
				for (const sheetName in newObjects) {
					for (const objName in newObjects[sheetName]) {
						sheet.detachObject(objName);
					}
				}
				setObjects({});
			};
		}, [appProject, theatreOptions, sheet]);

		// Subscribe to changes
		useEffect(() => {
			const unsubCallbacks = [];

			for (const sheetName in objects) {
				for (const objName in objects[sheetName]) {
					const obj = objects[sheetName][objName];
					if (!obj) continue;

					const unsub = obj.onValuesChange((val) => {
						setTheatreValues((prev) => ({
							...prev,
							[sheetName]: {
								...prev[sheetName],
								[objName]: val,
							},
						}));
					});

					unsubCallbacks.push(unsub);
				}
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
