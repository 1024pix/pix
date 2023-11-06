import accept from '@hapi/accept';
import { tokenService } from '../../domain/services/token-service.js';
import { LOCALE } from '../../../src/shared/domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = LOCALE;

export { escapeFileName, extractUserIdFromRequest, extractLocaleFromRequest };

function escapeFileName(fileName) {
  return fileName.replace(/[^_. A-Za-z0-9-]/g, '_');
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
  const acceptedLanguages = [ENGLISH_SPOKEN, FRENCH_SPOKEN, FRENCH_FRANCE];
  return accept.language(languageHeader, acceptedLanguages) || defaultLocale;
}
