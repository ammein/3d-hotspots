import { SheetProvider } from "@theatre/r3f";
import { useApp } from "../context/AppManagement";
import { useEffect, useState, useMemo } from "react";

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
 * @callback ReferenceStateSetter
 * @param {ReferenceState} state
 * @returns {void}
 */

/**
 *
 * @param {import('react').JSX} WrappedComponent
 * @param {Record<string, Record<string, TheatreObject>>} TheatreOptionsValues
 * @returns
 */
const withTheatreManagement = (WrappedComponent, theatreOptions) => {
	return (props) => {
		const { appProject } = useApp();

		/** @type {useState<ReferenceState>} */
		const [unsubscribe, setSubscribe] = useState({});
		const [values, setValues] = useState({});

		/**
		 * To Get Sheet from the main project
		 * @type {import('@theatre/core').ISheet}
		 */
		const sheet = useMemo(() => {
			return appProject.sheet(Object.keys(theatreOptions)[0]);
		}, [theatreOptions]);

		useEffect(() => {
			if (appProject.isReady) {
				const allOpts = Object.values(theatreOptions)[0];
				for (const options in allOpts) {
					if (!Object.hasOwn(allOpts, options)) continue;

					let theatreOptions = allOpts[options];

					setSubscribe((prevVal) => {
						return {
							...prevVal,
							[options]: sheet
								.object(
									options,
									Object.values(theatreOptions)[0],
									Object.values(theatreOptions)[1]
								)
								.onValuesChange((props) => {
									setValues((prevVal) => {
										return {
											...prevVal,
											[options]: {
												...props,
											},
										};
									});
								}),
						};
					});
				}
			}
		}, [appProject]);

		// Unsubscribe Once
		useEffect(() => {
			return () => {
				for (const name in unsubscribe) {
					let theatreObjectUnsubscribe = unsubscribe[name];

					theatreObjectUnsubscribe();
					sheet.detachObject(name);
				}

				setSubscribe({});
			};
		}, []);

		return (
			<SheetProvider sheet={sheet}>
				<WrappedComponent {...props} theatre={values} />;
			</SheetProvider>
		);
	};
};

export default withTheatreManagement;
