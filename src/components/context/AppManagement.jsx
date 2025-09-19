import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { loadTranslationsFromJSON, getLanguage } from '@/helpers/i18n';
import { getProject } from '@theatre/core';
import states from '@/assets/theatre-project-state.json';

const AppContext = createContext();

export default ({ children }) => {
  const [ready, setReady] = useState(false);
  const [translations, setTranslations] = useState({});
  const [, setLanguageState] = useState('en');
  const appProject = getProject('3D Hotspots', { state: states });

  const msg = useCallback(
    (key) => {
      if (!ready || key === undefined || key === null || key == '') return;

      if (!translations[key]) {
        if (import.meta.env.DEV) {
          if (!window.missingI18nKeys) {
            window.missingI18nKeys = {};
            console.warn(
              'I18N: Missing translation keys are being collected. Run `downloadMissingKeys()` in the browser console to download them as a JSON file.'
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
    const url = `${import.meta.env.VITE_BASE_URL}/lang/${lang}.json`;

    try {
      const data = await loadTranslationsFromJSON(url);
      setTranslations(data);
      if (appProject.isReady) {
        setReady(true);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }, []);

  useEffect(() => {
    const initialLang = getLanguage();
    setLanguage(initialLang);
  }, [setLanguage]);

  return (
    <AppContext.Provider
      value={{
        msg,
        ready,
        appProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 *
 * @returns {{ msg: function, ready: boolean, appProject: import('@theatre/core').IProject }}
 */
export const useApp = () => useContext(AppContext);
