import { LOCALE } from '../constants.js';

const { FRENCH_SPOKEN } = LOCALE;

function getTranslatedKey(key, locale, useFallback = true) {
  return key?.[locale] || (useFallback ? key?.[FRENCH_SPOKEN] : null);
}

export { getTranslatedKey };
