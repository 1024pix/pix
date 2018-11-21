const saml = require('../../infrastructure/saml');
const usecases = require('../../domain/usecases');
const logger = require('../../infrastructure/logger');
const tokenService = require('../../domain/services/token-service');

module.exports = {

  metadata(request, reply) {
    return reply(saml.getServiceProviderMetadata()).type('application/xml');
  },

  login(request, reply) {
    return reply.redirect(saml.createLoginRequest());
  },

  assert: async function(request, reply) {
    let userAttributes;
    try {
      userAttributes = await saml.parsePostResponse(request.payload);
    } catch (e) {
      logger.error(e);
      return reply(e.toString()).code(400);
    }

    try {
      const user = await usecases.getOrCreateSamlUser({ userAttributes });

      const token = tokenService.createTokenFromUser(user);

      return reply.redirect(`/connexion?token=${encodeURIComponent(token)}&user-id=${user.id}`);
    } catch(e) {
      logger.error(e);
      return reply(e.toString()).code(500);
    }
  },
};
