const { ENGLISH_SPOKEN } = require('../../domain/constants').LOCALE;

function getTranslatedText(locale, translations = { frenchText: '', englishText: '' }) {
  if (locale === ENGLISH_SPOKEN) {
    return translations.englishText;
  }

  return translations.frenchText;
}

function getTranslatedKey(key, locale) {
  if (key && key[locale]) {
    return key[locale];
  }
  return key?.fr;
}

module.exports = { getTranslatedText, getTranslatedKey };
