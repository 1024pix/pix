import { LocaleFormatError, LocaleNotSupportedError } from '../errors.js';

const ENGLISH_SPOKEN = 'en';
const FRENCH_FRANCE = 'fr-fr';
const FRENCH_SPOKEN = 'fr';
const DUTCH_SPOKEN = 'nl';
const SPANISH_SPOKEN = 'es';

const CHALLENGE_LOCALES = ['en', 'fr', 'fr-fr', 'nl', 'es', 'it', 'de'];

const DEFAULT_CHALLENGE_LOCALE = 'fr-fr';

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'fr-BE', 'fr-FR', 'nl-BE', 'nl'];

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'nl'];

const DEFAULT_LOCALE = 'fr';

/**
 * Returns all locales available in challenges of the Pix platform
 */
function getChallengeLocales() {
  return CHALLENGE_LOCALES;
}

function getDefaultChallengeLocale() {
  return DEFAULT_CHALLENGE_LOCALE;
}

function getSupportedLocales() {
  return SUPPORTED_LOCALES;
}

/**
 * @deprecated use getSupportedLocales or getChallengeLocales instead whenever possible.
 */
function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

function getDefaultLocale() {
  return DEFAULT_LOCALE;
}

/**
 * Returns the given language if the language is supported, otherwise returns the default locale.
 * @deprecated will soon be removed
 */
function coerceLanguage(language) {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    return language;
  }

  return DEFAULT_LOCALE;
}

const getCanonicalLocale = function (locale) {
  let canonicalLocale;

  try {
    canonicalLocale = Intl.getCanonicalLocales(locale)[0];
  } catch {
    throw new LocaleFormatError(locale);
  }

  if (!SUPPORTED_LOCALES.includes(canonicalLocale)) {
    throw new LocaleNotSupportedError(canonicalLocale);
  }

  return canonicalLocale;
};

export {
  coerceLanguage,
  DUTCH_SPOKEN,
  ENGLISH_SPOKEN,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
  getCanonicalLocale,
  getChallengeLocales,
  getDefaultChallengeLocale,
  getDefaultLocale,
  getSupportedLanguages,
  getSupportedLocales,
  SPANISH_SPOKEN,
};
