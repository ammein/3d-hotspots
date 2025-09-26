import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { loadFromJSON, getLanguage } from '@/helpers/i18n';
import { getProject } from '@theatre/core';
import states from '@/assets/theatre-project-state.json';

/**
 * @typedef AppContext
 * @property {Function} msg
 * @property {boolean} ready
 * @property {import('@theatre/core').IProject} appProject
 * @property {object} metadata
 */

const AppContext = createContext();

export default ({ children }) => {
  const [ready, setReady] = useState(false);
  const [translations, setTranslations] = useState({});
  const [metadataValue, setMetadataValue] = useState({});
  const [, setLanguageState] = useState('en');
  const appProject = useMemo(() => {
    return getProject('3D Hotspots', {
      state: states,
      assets: {
        baseUrl: '/theatrejs-assets',
      },
    });
  }, [states]);

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

  const setMetadata = useCallback(async (filename) => {
    const url = `${import.meta.env.VITE_BASE_URL}/${filename}.json`;

    try {
      const data = await loadFromJSON(url);
      setMetadataValue(data);
    } catch (err) {
      setReady(false);
      console.error('Failed to load metadata json', err);
    }
  });

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    const url = `${import.meta.env.VITE_BASE_URL}/lang/${lang}.json`;

    try {
      const data = await loadFromJSON(url);
      setTranslations(data);
    } catch (error) {
      setReady(false);
      console.error('Failed to load translations:', error);
    }
  });

  useEffect(() => {
    // Check if metadata & language is loaded
    if (
      appProject.isReady &&
      Object.keys(translations).length > 0 &&
      Object.keys(metadataValue).length > 0
    ) {
      setReady(true);
    } else {
      const initialLang = getLanguage();
      setLanguage(initialLang);
      setMetadata('metadata');
    }
  }, [metadataValue, translations]);

  return (
    <AppContext.Provider
      value={{
        msg,
        ready,
        appProject,
        metadata: metadataValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * @returns {AppContext}
 */
export const useApp = () => useContext(AppContext);
