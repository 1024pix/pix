import { LOCALE } from '../constants.js';

const { FRENCH_SPOKEN } = LOCALE;

function getTranslatedKey(key, locale) {
  return key?.[locale] || key?.[FRENCH_SPOKEN];
}

export { getTranslatedKey };
