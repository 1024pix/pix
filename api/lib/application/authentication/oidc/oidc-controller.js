const authenticationServiceRegistry = require('../../../domain/services/authentication/authentication-service-registry');
const get = require('lodash/get');
const authenticationRegistry = require('../../../domain/services/authentication/authentication-service-registry');
const serializer = require('../../../infrastructure/serializers/jsonapi/oidc-identity-providers-serializer');
const OidcIdentityProviders = require('../../../domain/constants/oidc-identity-providers');
const usecases = require('../../../domain/usecases');
const { UnauthorizedError } = require('../../http-errors');
const config = require('../../../config');
const oidcSerializer = require('../../../infrastructure/serializers/jsonapi/oidc-serializer');

module.exports = {
  async getIdentityProviders(request, h) {
    return h.response(serializer.serialize(Object.values(OidcIdentityProviders))).code(200);
  },

  async getRedirectLogoutUrl(request, h) {
    const userId = request.auth.credentials.userId;
    const { identity_provider: identityProvider, logout_url_uuid: logoutUrlUUID } = request.query;
    const oidcAuthenticationService = authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({
      userId,
      logoutUrlUUID,
    });

    return h.response({ redirectLogoutUrl }).code(200);
  },

  async findUserForReconciliation(request, h) {
    const { email, password, identityProvider, authenticationKey } = request.deserializedPayload;

    const result = await usecases.findUserForOidcReconciliation({
      email,
      password,
      identityProvider,
      authenticationKey,
    });

    return h.response(oidcSerializer.serialize(result)).code(200);
  },

  async reconcileUser(request, h) {
    const { identityProvider, authenticationKey } = request.deserializedPayload;
    const oidcAuthenticationService = authenticationRegistry.lookupAuthenticationService(identityProvider);

    const result = await usecases.reconcileOidcUser({
      authenticationKey,
      oidcAuthenticationService,
    });

    return h.response({ access_token: result.accessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
  },

  async getAuthenticationUrl(request, h) {
    const { identity_provider: identityProvider } = request.query;
    const oidcAuthenticationService = authenticationRegistry.lookupAuthenticationService(identityProvider);
    const result = oidcAuthenticationService.getAuthenticationUrl({ redirectUri: request.query['redirect_uri'] });
    return h.response(result).code(200);
  },

  async authenticateUser(request, h) {
    const { code, identityProvider, redirectUri, stateSent, stateReceived } = request.deserializedPayload;
    let authenticatedUserId;
    if (!config.featureToggles.isSsoAccountReconciliationEnabled) {
      authenticatedUserId =
        identityProvider === OidcIdentityProviders.POLE_EMPLOI.code
          ? get(request.auth, 'credentials.userId')
          : undefined;
    }
    const oidcAuthenticationService = authenticationRegistry.lookupAuthenticationService(identityProvider);

    const result = await usecases.authenticateOidcUser({
      authenticatedUserId,
      code,
      redirectUri,
      stateReceived,
      stateSent,
      oidcAuthenticationService,
    });

    if (result.isAuthenticationComplete) {
      return h.response({ access_token: result.pixAccessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
    } else {
      const message = "L'utilisateur n'a pas de compte Pix";
      const responseCode = 'SHOULD_VALIDATE_CGU';
      const meta = { authenticationKey: result.authenticationKey };
      throw new UnauthorizedError(message, responseCode, meta);
    }
  },

  async createUser(request, h) {
    const { identityProvider, authenticationKey } = request.deserializedPayload;

    const oidcAuthenticationService = await authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const { accessToken, logoutUrlUUID } = await usecases.createOidcUser({
      authenticationKey,
      identityProvider,
      oidcAuthenticationService,
    });

    const response = { access_token: accessToken, logout_url_uuid: logoutUrlUUID };
    return h.response(response).code(200);
  },
};
