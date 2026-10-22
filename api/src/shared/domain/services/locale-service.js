const ENGLISH_SPOKEN = 'en';
const FRENCH_FRANCE = 'fr-fr';
const FRENCH_SPOKEN = 'fr';
const FRENCH_FRANCE_LOCALE = 'fr-FR';

const DEFAULT_CHALLENGE_LOCALE = 'fr-fr';
const CHALLENGE_LOCALES = ['de', 'de-AT', 'en', 'es', 'es-419', 'fr', 'fr-fr', 'it', 'nl'];

const DEFAULT_LOCALE = 'fr';
const SUPPORTED_LOCALES = ['de-AT', 'en', 'es', 'es-419', 'fr', 'nl', 'fr-BE', 'fr-FR', 'nl-BE', 'it'];

const SUPPORTED_LANGUAGES = Array.from(new Set(SUPPORTED_LOCALES.map((locale) => new Intl.Locale(locale).language)));

/**
 * @returns {string[]} - all locales available in challenges of the Pix platform
 */
function getChallengeLocales() {
  return CHALLENGE_LOCALES;
}

/**
 * @returns {string} - the default locale for challenges
 */
function getDefaultChallengeLocale() {
  return DEFAULT_CHALLENGE_LOCALE;
}

/**
 * @returns {string[]} - all supported locales by the Pix platform
 */
function getSupportedLocales() {
  return SUPPORTED_LOCALES;
}

/**
 * @deprecated use getSupportedLocales or getChallengeLocales instead whenever possible
 * @returns {string[]} - all supported languages by the Pix platform
 */
function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * @returns {string} - the default locale for the Pix platform
 */
function getDefaultLocale() {
  return DEFAULT_LOCALE;
}

/**
 * @deprecated will soon be removed
 * @returns {string} - the given language if the language is supported, otherwise returns the default locale
 */
function coerceLanguage(language) {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    return language;
  }
  return DEFAULT_LOCALE;
}

/**
 * @returns {string} - the nearest supported locale by Pix platform according the given locale
 */
function getNearestSupportedLocale(locale) {
  if (!locale) return undefined;
  try {
    const intlLocale = new Intl.Locale(locale);

    if (SUPPORTED_LOCALES.includes(intlLocale.toString())) {
      return intlLocale.toString();
    }

    const localeMatch = SUPPORTED_LOCALES.find((l) => new Intl.Locale(l).language === intlLocale.language);
    if (localeMatch) return localeMatch;

    return DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * @returns {string} - the base locale (ex: 'fr', 'en'...) according the given locale (ex: 'fr-FR', 'en-GB')
 */
function getBaseLocale(locale) {
  try {
    return new Intl.Locale(locale).language;
  } catch {
    return new Intl.Locale(DEFAULT_LOCALE).language;
  }
}

/**
 * @returns {string|undefined} - the canonical locale without extensions (ex: 'fr-FR' for 'fr-fr'), or undefined if the given locale is invalid
 */
function normalizeLocale(locale) {
  try {
    return new Intl.Locale(locale).baseName;
  } catch {
    return undefined;
  }
}

/**
 * @returns {boolean} - returns true when locale from France (ex: fr-fr or fr-FR), otherwise false
 */
function isFranceLocale(locale) {
  const supportedLocale = getNearestSupportedLocale(locale) || DEFAULT_LOCALE;
  return supportedLocale === FRENCH_FRANCE_LOCALE;
}

/**
 * @param {string} locale
 * @returns {string} - returns the nearest challenge locale according to the given locale
 */
function getNearestChallengeLocale(locale) {
  if (!locale) {
    return getDefaultChallengeLocale();
  }

  try {
    const intlLocale = new Intl.Locale(locale);

    if (intlLocale.toString() === FRENCH_FRANCE_LOCALE) {
      return FRENCH_FRANCE;
    }

    if (CHALLENGE_LOCALES.includes(intlLocale.toString())) {
      return intlLocale.toString();
    }

    const localeMatch = CHALLENGE_LOCALES.find((l) => new Intl.Locale(l).language === intlLocale.language);
    if (localeMatch) return localeMatch;

    return DEFAULT_CHALLENGE_LOCALE;
  } catch {
    return DEFAULT_CHALLENGE_LOCALE;
  }
}

/**
 * Given a challenge locale, returns an array of compatible challenge locales.
 * Exemples :
 * For `en` returns [`en`]
 * For `fr-BE` returns [`fr-BE`, `fr`]
 *
 * @param {string} locale
 * @returns {string[]}
 */
function fallbackChallengeLocales(locale) {
  const localeInstance = new Intl.Locale(locale);
  if (localeInstance.toString() === localeInstance.language) return [locale];
  return [locale, localeInstance.language];
}

export {
  coerceLanguage,
  ENGLISH_SPOKEN,
  fallbackChallengeLocales,
  FRENCH_FRANCE,
  FRENCH_SPOKEN,
  getBaseLocale,
  getChallengeLocales,
  getDefaultChallengeLocale,
  getDefaultLocale,
  getNearestChallengeLocale,
  getNearestSupportedLocale,
  getSupportedLanguages,
  getSupportedLocales,
  isFranceLocale,
  normalizeLocale,
};
