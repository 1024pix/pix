import { LanguageNotSupportedError } from '../errors.js';

const LANGUAGES_CODE = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  DUTCH: 'nl',
  SPANISH: 'es',
};

const AVAILABLE_LANGUAGES = Object.values(LANGUAGES_CODE);

function assertLanguageAvailability(languageCode) {
  if (!languageCode) return;

  if (!AVAILABLE_LANGUAGES.includes(languageCode)) {
    throw new LanguageNotSupportedError(languageCode);
  }
}

export { assertLanguageAvailability, AVAILABLE_LANGUAGES, LANGUAGES_CODE };
