const tokenService = require('../../domain/services/token-service');
const accept = require('@hapi/accept');

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
  const defaultLocale = 'fr-fr';
  const languageHeader = request.headers && request.headers['accept-language'];
  if (!languageHeader) {
    return defaultLocale;
  }
  return accept.language(languageHeader, ['fr', 'fr-fr']) || defaultLocale;
}
