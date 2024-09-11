import { config } from '../../../../src/shared/config.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { usecases } from '../../domain/usecases/index.js';
import * as saml from '../../infrastructure/saml.js';

const metadata = function (request, h) {
  return h.response(saml.getServiceProviderMetadata()).type('application/xml');
};

const login = function (request, h) {
  return h.redirect(saml.createLoginRequest());
};

const assert = async function (request, h) {
  let userAttributes;
  try {
    userAttributes = await saml.parsePostResponse(request.payload);
  } catch (e) {
    logger.error({ e }, 'SAML: Error while parsing post response');
    return h.response(e.toString()).code(400);
  }

  try {
    const redirectionUrl = await usecases.getSamlAuthenticationRedirectionUrl({
      userAttributes,
      tokenService,
      config,
    });

    return h.redirect(redirectionUrl);
  } catch (e) {
    logger.error({ e }, 'SAML: Error while get external authentication redirection url');
    return h.response(e.toString()).code(500);
  }
};

const samlController = { metadata, login, assert };

export { samlController };
