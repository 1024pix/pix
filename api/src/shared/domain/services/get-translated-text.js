import { FRENCH_SPOKEN } from '../services/locale-service.js';

function getTranslatedKey(key, locale, useFallback = true) {
  return key?.[locale] || (useFallback ? key?.[FRENCH_SPOKEN] : null);
}

export { getTranslatedKey };
