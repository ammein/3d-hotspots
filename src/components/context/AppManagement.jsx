/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect, useContext, useMemo, useRef } from 'react';
import { loadFromJSON, getLanguage } from '@/helpers/i18n';
import { getProject } from '@theatre/core';
import states from '@/assets/theatre-project-state.json';
import { IntlProvider } from 'use-intl';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Button from '@/components/Button';

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
    baseUrl: import.meta.env.PROD ? `${import.meta.env.VITE_BASE_URL}/theatrejs-assets` : '/theatrejs-assets',
  },
};

const AppManagement = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [translations, setTranslations] = useState({});
  const [metadataValue, setMetadataValue] = useState({});
  const ellipsesLoading = useRef();
  const appProject = useMemo(() => {
    try {
      return getProject('3D Hotspots', stateProject);
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      window.location.reload(false);
    }
  }, []);

  const errorTranslations = useCallback((error) => {
    if (import.meta.env.DEV) {
      console.warn(error.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (appProject.isReady && Object.keys(translations).length > 0 && Object.keys(metadataValue).length > 0) {
        setReady(true);
        return;
      }

      const initialLang = getLanguage();

      try {
        const [langData, metaData] = await Promise.all([
          loadFromJSON(`${import.meta.env.VITE_BASE_URL}/lang/${initialLang}.json`),
          loadFromJSON(`${import.meta.env.VITE_BASE_URL}/metadata.json`),
        ]);

        if (cancelled) return;

        setTranslations(langData);
        setMetadataValue(metaData);
        // if appProject is ready and translations+metadata present, mark ready
        if (appProject.isReady && Object.keys(langData).length > 0 && Object.keys(metaData).length > 0) {
          setReady(true);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('init load failed', err);
        if (!cancelled) setReady(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [appProject.isReady, translations, metadataValue]);

  // Ellipses Animation
  useGSAP(() => {
    if (ellipsesLoading.current) {
      const typeLoading = gsap.timeline({ paused: true, repeat: -1 });
      typeLoading
        .from(ellipsesLoading.current, {
          duration: 0.2,
          text: {
            value: '',
            type: 'diff',
          },
        })

        .to(ellipsesLoading.current, {
          duration: 0.6,
          text: {
            value: '...',
            type: 'diff',
          },
        });

      if (Object.keys(translations).length === 0) {
        typeLoading.play();
      }
      if (Object.keys(translations).length > 0) {
        typeLoading.pause(0);
      }
    }
  }, [translations]);

  if (Object.keys(translations).length === 0) {
    return (
      <Button
        disabled={true}
        buttonType="scream"
        size="large"
        weight="bold"
        other={/* tailwindcss */ '!size-fit overflow-auto !m-auto absolute z-100 !top-0 !left-0 !right-0 !bottom-0'}
      >
        <span ref={ellipsesLoading} />
      </Button>
    );
  }

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

export default AppManagement;

/**
 * @returns {AppContext}
 */
export const useApp = () => useContext(AppContext);
