import saml from '../../infrastructure/saml';
import usecases from '../../domain/usecases';
import logger from '../../infrastructure/logger';
import tokenService from '../../domain/services/token-service';
import settings from '../../config';

export default {
  metadata(request, h) {
    return h.response(saml.getServiceProviderMetadata()).type('application/xml');
  },

  login(request, h) {
    return h.redirect(saml.createLoginRequest());
  },

  assert: async function (request, h) {
    let userAttributes;
    try {
      userAttributes = await saml.parsePostResponse(request.payload);
    } catch (e) {
      logger.error({ e }, 'SAML: Error while parsing post response');
      return h.response(e.toString()).code(400);
    }

    try {
      const redirectionUrl = await usecases.getExternalAuthenticationRedirectionUrl({
        userAttributes,
        tokenService,
        settings,
      });

      return h.redirect(redirectionUrl);
    } catch (e) {
      logger.error({ e }, 'SAML: Error while get external authentication redirection url');
      return h.response(e.toString()).code(500);
    }
  },
};
