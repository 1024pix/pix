const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../domain/constants').LOCALE;

function challengeHasLocale(challenge, locale) {
  const locales = _getSmartLocales(challenge);
  return locales.includes(locale);
}

function _getSmartLocales(challenge) {
  return challenge.locales.map((locale) => {
    if ([ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN].includes(locale)) {
      return locale;
    }
    return FRENCH_SPOKEN;
  });
}

module.exports = {
  challengeHasLocale,
};
