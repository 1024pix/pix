import { LocaleFormatError, LocaleNotSupportedError } from '../errors.js';

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'fr-BE', 'fr-FR', 'nl-BE', 'nl'];

function getSupportedLocales() {
  return SUPPORTED_LOCALES;
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

export { getCanonicalLocale, getSupportedLocales };
