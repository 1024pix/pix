const { ENGLISH_SPOKEN } = require('../../domain/constants').LOCALE;

function getTranslatedText(locale, translations = { frenchText: '', englishText: '' }) {
  if (locale === ENGLISH_SPOKEN) {
    return translations.englishText;
  }

  return translations.frenchText;
}

module.exports = { getTranslatedText };
