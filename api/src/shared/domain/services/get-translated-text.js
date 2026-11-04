import { FRENCH_SPOKEN } from '../services/locale-service.js';

function getTranslatedKey(key, locale, useFallback = true) {
  if (key?.[locale]) return key?.[locale];

  const splitLocale = locale?.split('-') ?? [];
  const [lang] = splitLocale;
  if (splitLocale.length === 2 && lang && key?.[lang]) return key?.[lang];

  return useFallback ? key?.[FRENCH_SPOKEN] : null;
}

export { getTranslatedKey };
