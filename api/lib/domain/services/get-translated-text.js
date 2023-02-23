const { FRENCH_SPOKEN } = require('../../domain/constants.js').LOCALE;

function getTranslatedKey(key, locale) {
  return key?.[locale] || key?.[FRENCH_SPOKEN];
}

module.exports = { getTranslatedKey };
