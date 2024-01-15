const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;

const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
};

const SUPPORTED_LOCALES = ['en', 'fr', 'fr-BE', 'fr-FR'];

const constants = {
  LEVENSHTEIN_DISTANCE_MAX_RATE,
};

export { constants, LEVENSHTEIN_DISTANCE_MAX_RATE, LOCALE, SUPPORTED_LOCALES };
