import accept from '@hapi/accept';

import { LOCALE } from '../../../shared/domain/constants.js';
import { LANGUAGES_CODE } from '../../../shared/domain/services/language-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;
const { DUTCH } = LANGUAGES_CODE;
const requestResponseUtils = { escapeFileName, extractUserIdFromRequest, extractLocaleFromRequest };

export { escapeFileName, extractLocaleFromRequest, extractUserIdFromRequest, requestResponseUtils };

function escapeFileName(fileName) {
  return fileName
    .normalize('NFD')
    .toLowerCase()
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^_. a-z0-9-]/g, '')
    .trim()
    .replace(/ /g, '_');
}

function extractUserIdFromRequest(request) {
  if (request.headers && request.headers.authorization) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    return tokenService.extractUserId(token);
  }
  return null;
}

function extractLocaleFromRequest(request) {
  const defaultLocale = FRENCH_FRANCE;
  const languageHeader = request.headers && request.headers['accept-language'];
  if (!languageHeader) {
    return defaultLocale;
  }
  const acceptedLanguages = [ENGLISH_SPOKEN, FRENCH_SPOKEN, FRENCH_FRANCE, DUTCH];
  return accept.language(languageHeader, acceptedLanguages) || defaultLocale;
}
