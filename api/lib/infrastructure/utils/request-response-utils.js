const accept = require('@hapi/accept');
const tokenService = require('../../domain/services/token-service');
const { FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../domain/constants').LOCALE;

module.exports = { escapeFileName, extractUserIdFromRequest, extractLocaleFromRequest };

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
  return accept.language(languageHeader, [FRENCH_SPOKEN, FRENCH_FRANCE]) || defaultLocale;
}
