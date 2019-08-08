const saml = require('../../infrastructure/saml');
const usecases = require('../../domain/usecases');
const logger = require('../../infrastructure/logger');
const tokenService = require('../../domain/services/token-service');

module.exports = {

  metadata(request, h) {
    return h.response(saml.getServiceProviderMetadata()).type('application/xml');
  },

  login(request, h) {
    return h.redirect(saml.createLoginRequest());
  },

  assert: async function(request, h) {
    let userAttributes;
    try {
      userAttributes = await saml.parsePostResponse(request.payload);
    } catch (e) {
      logger.error(e);
      return h.response(e.toString()).code(400);
    }

    try {
      const user = await usecases.getOrCreateSamlUser({ userAttributes });

      const token = tokenService.createTokenFromUser(user, 'external');

      return h.redirect(`/?token=${encodeURIComponent(token)}&user-id=${user.id}`);
    } catch (e) {
      logger.error(e);
      return h.response(e.toString()).code(500);
    }
  },
};
