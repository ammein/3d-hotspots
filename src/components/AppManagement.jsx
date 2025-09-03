import {
	createContext,
	useState,
	useCallback,
	useEffect,
	useContext,
} from "react";
import { loadTranslationsFromJSON, getLanguage } from "@/helpers/i18n";

const I18nContext = createContext();

export default ({ children }) => {
	const [ready, setReady] = useState(false);
	const [translations, setTranslations] = useState({});
	const [, setLanguageState] = useState("en");

	const msg = useCallback(
		(key) => {
			if (!ready || key === undefined || key === null || key == "") return;

			if (!translations[key]) {
				if (import.meta.env.DEV) {
					if (!window.missingI18nKeys) {
						window.missingI18nKeys = {};
						console.warn(
							"I18N: Missing translation keys are being collected. Run `downloadMissingKeys()` in the browser console to download them as a JSON file."
						);
					}
					window.missingI18nKeys[key] = key;
				}
				console.warn(`Missing translation for key: ${key}`);
				return key;
			}
			return translations[key];
		},
		[ready, translations]
	);

	const setLanguage = useCallback(async (lang) => {
		setLanguageState(lang);
		/*const url = import.meta.env.DEV
? `${import.meta.env.VITE_BASE_URL}/assets/content.json`
: `${import.meta.env.VITE_BASE_URL}/lang/${lang}.json`;*/
		const url = `${import.meta.env.VITE_BASE_URL}/lang/${lang}.json`;

		try {
			const data = await loadTranslationsFromJSON(url);
			setTranslations(data);
			setReady(true);
		} catch (error) {
			console.error("Failed to load translations:", error);
		}
	}, []);

	useEffect(() => {
		const initialLang = getLanguage();
		setLanguage(initialLang);
	}, [setLanguage]);

	return (
		<I18nContext.Provider
			value={{
				msg,
				ready,
			}}
		>
			{children}
		</I18nContext.Provider>
	);
};

export const useI18n = () => useContext(I18nContext);
