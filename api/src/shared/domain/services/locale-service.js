import { SUPPORTED_LOCALES } from '../constants.js';
import { LocaleFormatError, LocaleNotSupportedError } from '../errors.js';

const getCanonicalLocale = function (locale) {
  let canonicalLocale;

  try {
    canonicalLocale = Intl.getCanonicalLocales(locale)[0];
  } catch (error) {
    throw new LocaleFormatError(locale);
  }

  if (!SUPPORTED_LOCALES.includes(canonicalLocale)) {
    throw new LocaleNotSupportedError(canonicalLocale);
  }

  return canonicalLocale;
};

export { getCanonicalLocale };
