import { LanguageNotSupportedError } from '../errors.js';

const LANGUAGES_CODE = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  DUTCH: 'nl',
};

const AVAILABLE_LANGUAGES = Object.values(LANGUAGES_CODE);

function assertLanguageAvailability(languageCode) {
  if (!languageCode) return;

  if (!AVAILABLE_LANGUAGES.includes(languageCode)) {
    throw new LanguageNotSupportedError(languageCode);
  }
}

export { LANGUAGES_CODE, AVAILABLE_LANGUAGES, assertLanguageAvailability };
