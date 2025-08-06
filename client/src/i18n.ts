import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import esCommon from './locales/es/common.json';
import esErrors from './locales/es/errors.json';
import frCommon from './locales/fr/common.json';
import frErrors from './locales/fr/errors.json';

const resources = {
  en: {
    common: enCommon,
    errors: enErrors,
  },
  es: {
    common: esCommon,
    errors: esErrors,
  },
  fr: {
    common: frCommon,
    errors: frErrors,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    defaultNS: 'common',
    ns: ['common', 'errors'],
  });

export default i18n;