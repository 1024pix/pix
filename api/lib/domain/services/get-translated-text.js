import { LOCALE } from '../../domain/constants.js';

const { FRENCH_SPOKEN } = LOCALE;

function getTranslatedKey(key, locale) {
  return key?.[locale] || key?.[FRENCH_SPOKEN];
}

export { getTranslatedKey };
