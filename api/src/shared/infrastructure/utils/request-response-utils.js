import accept from '@hapi/accept';

import { LANGUAGES_CODE } from '../../../shared/domain/services/language-service.js';
import { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } from '../../../shared/domain/services/locale-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

const { DUTCH, SPANISH } = LANGUAGES_CODE;
const requestResponseUtils = {
  escapeFileName,
  extractUserIdFromRequest,
  extractLocaleFromRequest,
  extractTimestampFromRequest,
};

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
  const acceptedLanguages = [ENGLISH_SPOKEN, FRENCH_SPOKEN, FRENCH_FRANCE, DUTCH, SPANISH];
  return accept.language(languageHeader, acceptedLanguages) || defaultLocale;
}

function extractTimestampFromRequest(request) {
  return request.info.received;
}

export {
  escapeFileName,
  extractLocaleFromRequest,
  extractTimestampFromRequest,
  extractUserIdFromRequest,
  requestResponseUtils,
};
