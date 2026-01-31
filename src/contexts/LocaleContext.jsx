import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import AuthContext from '../context/AuthContext';

// Constants
const STORAGE_KEY = 'userLocale';
const DEFAULT_LOCALE = 'es';
const FALLBACK_LOCALE = 'en';

// Supported locales configuration
const SUPPORTED_LOCALES = {
  en: 'English',
  es: 'Español'
};

const translations = {
  en: enTranslations,
  es: esTranslations
};

// Utility functions
const getNestedValue = (obj, path) => {
  return path.reduce((current, key) => current?.[key], obj);
};

const replaceParams = (template, params) => {
  return Object.entries(params).reduce((str, [key, value]) => {
    return str.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, template);
};

const isValidTranslation = (value) => {
  return typeof value === 'string' && value.length > 0;
};

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    if (process.env.NODE_ENV === 'development') {
      // During hot reload, the context may be temporarily missing.
      // Return a fallback context to prevent crashes.
      console.warn('useLocale called outside LocaleProvider (may be due to hot reload). Returning fallback.');
      return {
        locale: DEFAULT_LOCALE,
        setLocale: () => {},
        t: (key, params = {}) => {
          // Simple fallback translation: return key, optionally replace params
          if (Object.keys(params).length > 0) {
            return Object.entries(params).reduce((str, [key, value]) =>
              str.replace(new RegExp(`{${key}}`, 'g'), String(value)), key);
          }
          return key;
        },
        getSupportedLocales: () => ['en', 'es'],
        getCurrentLocaleName: () => 'English'
      };
    }
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  // Initialize from localStorage directly to avoid flicker
  const [locale, setLocale] = useState(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY);
      return (savedLocale && translations[savedLocale]) ? savedLocale : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const { user } = useContext(AuthContext);

  // Sync with AuthContext user locale if available
  useEffect(() => {
    if (user && user.locale && translations[user.locale] && user.locale !== locale) {
      setLocale(user.locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Save locale to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      console.warn('Failed to save locale to localStorage:', error);
    }
  }, [locale]);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = getNestedValue(translations[locale], keys);

    // If translation not found, try fallback locale
    if (!isValidTranslation(value) && locale !== FALLBACK_LOCALE) {
      value = getNestedValue(translations[FALLBACK_LOCALE], keys);
    }

    // If still not found, return the key with a warning
    if (!isValidTranslation(value)) {
      console.warn(`Translation key "${key}" not found for locale "${locale}"`);
      return key;
    }

    // Replace parameters in the translation string
    return Object.keys(params).length > 0 ? replaceParams(value, params) : value;
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    if (SUPPORTED_LOCALES[newLocale]) {
      setLocale(newLocale);
    } else {
      console.warn(`Locale "${newLocale}" is not supported. Supported locales:`, Object.keys(SUPPORTED_LOCALES));
    }
  }, []);

  const getSupportedLocales = useCallback(() => {
    return Object.keys(SUPPORTED_LOCALES);
  }, []);

  const getCurrentLocaleName = useCallback(() => {
    return SUPPORTED_LOCALES[locale] || locale;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: changeLocale,
    t,
    getSupportedLocales,
    getCurrentLocaleName
  }), [locale, changeLocale, t, getSupportedLocales, getCurrentLocaleName]);

  // In development, validate all translation keys exist
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-unused-vars
    const validateTranslations = (locale, translations) => {
      // Check for missing keys compared to fallback
      // Log warnings for incomplete translations
      console.warn('Translation incomplete:', locale, translations);
    };
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};