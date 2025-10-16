import { createContext, useState, useCallback, useEffect, useContext, useMemo } from 'react';
import { loadFromJSON, getLanguage } from '@/helpers/i18n';
import { getProject } from '@theatre/core';
import states from '@/assets/theatre-project-state.json';
import { IntlProvider } from 'use-intl';

/**
 * @typedef AppContext
 * @property {boolean} ready
 * @property {import('@theatre/core').IProject} appProject
 * @property {object} metadata
 */

const AppContext = createContext();

const stateProject = {
  state: states,
  assets: {
    baseUrl: import.meta.env.PROD ? import.meta.env.VITE_BASE_URL + '/theatrejs-assets' : '/theatrejs-assets',
  },
};

export default ({ children }) => {
  const [ready, setReady] = useState(false);
  const [translations, setTranslations] = useState({});
  const [metadataValue, setMetadataValue] = useState({});
  const [, setLanguageState] = useState('en');
  const appProject = useMemo(() => {
    try {
      return getProject('3D Hotspots', stateProject);
    } catch (err) {
      window.location.reload(false);
    }
  }, [states]);

  const errorTranslations = useCallback(
    (error) => {
      if (import.meta.env.DEV) {
        console.warn(error.message);
      }
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
    if (appProject.isReady && Object.keys(translations).length > 0 && Object.keys(metadataValue).length > 0) {
      setReady(true);
    } else {
      const initialLang = getLanguage();
      setLanguage(initialLang);
      setMetadata('metadata');
    }
  }, [metadataValue, translations]);

  if (Object.keys(translations).length === 0) return <p>Loading...</p>;

  return (
    <AppContext.Provider
      value={{
        ready,
        appProject,
        metadata: metadataValue,
      }}
    >
      <IntlProvider messages={translations} locale={getLanguage()} onError={errorTranslations}>
        {children}
      </IntlProvider>
    </AppContext.Provider>
  );
};

/**
 * @returns {AppContext}
 */
export const useApp = () => useContext(AppContext);
