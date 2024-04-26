import { LanguageNotSupportedError } from '../errors.js';

const LANGUAGES_CODE = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  DUTCH: 'nl',
  SPANISH: 'es',
};

const AVAILABLE_LANGUAGES = Object.values(LANGUAGES_CODE);
const V3_CERTIFICATION_AVAILABLE_LANGUAGES = [LANGUAGES_CODE.ENGLISH, LANGUAGES_CODE.FRENCH];

function assertLanguageAvailability(languageCode) {
  if (!languageCode) return;

  if (!AVAILABLE_LANGUAGES.includes(languageCode)) {
    throw new LanguageNotSupportedError(languageCode);
  }
}

function isLanguageAvailableForV3Certification(lang) {
  if (!lang) return;

  return V3_CERTIFICATION_AVAILABLE_LANGUAGES.includes(lang);
}

export { assertLanguageAvailability, AVAILABLE_LANGUAGES, isLanguageAvailableForV3Certification, LANGUAGES_CODE };
