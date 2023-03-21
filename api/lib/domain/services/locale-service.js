const { LocaleFormatError, LocaleNotSupportedError } = require('../errors');
const { SUPPORTED_LOCALES } = require('../constants');

module.exports = {
  getCanonicalLocale(locale) {
    let formattedLocale;

    try {
      formattedLocale = Intl.getCanonicalLocales(locale)[0];
    } catch (error) {
      throw new LocaleFormatError(locale);
    }

    // Pix site uses en-GB as international English locale instead of en
    // TODO remove this code after handling en as international English locale on Pix site
    if (formattedLocale === 'en-GB') {
      formattedLocale = 'en';
    }

    if (!SUPPORTED_LOCALES.includes(formattedLocale)) {
      throw new LocaleNotSupportedError(formattedLocale);
    }

    return formattedLocale;
  },
};
