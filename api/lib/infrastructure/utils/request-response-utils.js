import accept from '@hapi/accept';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import { SUPPORTED_LOCALES, LOCALE } from '../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE } = LOCALE;

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
  return accept.language(languageHeader, SUPPORTED_LOCALES) || defaultLocale;
}
