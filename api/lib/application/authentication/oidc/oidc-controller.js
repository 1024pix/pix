const authenticationServiceRegistry = require('../../../domain/services/authentication/authentication-service-registry.js');
const serializer = require('../../../infrastructure/serializers/jsonapi/oidc-identity-providers-serializer.js');
const usecases = require('../../../domain/usecases/index.js');
const { UnauthorizedError } = require('../../http-errors.js');
const oidcSerializer = require('../../../infrastructure/serializers/jsonapi/oidc-serializer.js');

module.exports = {
  async getIdentityProviders(request, h) {
    const identityProviders = usecases.getIdentityProviders();
    return h.response(serializer.serialize(identityProviders)).code(200);
  },

  async getRedirectLogoutUrl(
    request,
    h,
    dependencies = {
      authenticationServiceRegistry,
    }
  ) {
    const userId = request.auth.credentials.userId;
    const { identity_provider: identityProvider, logout_url_uuid: logoutUrlUUID } = request.query;
    const oidcAuthenticationService =
      dependencies.authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({
      userId,
      logoutUrlUUID,
    });

    return h.response({ redirectLogoutUrl }).code(200);
  },

  async findUserForReconciliation(
    request,
    h,
    dependencies = {
      oidcSerializer,
    }
  ) {
    const { email, password, identityProvider, authenticationKey } = request.deserializedPayload;

    const result = await usecases.findUserForOidcReconciliation({
      email,
      password,
      identityProvider,
      authenticationKey,
    });

    return h.response(dependencies.oidcSerializer.serialize(result)).code(200);
  },

  async reconcileUser(
    request,
    h,
    dependencies = {
      authenticationServiceRegistry,
    }
  ) {
    const { identityProvider, authenticationKey } = request.deserializedPayload;
    const oidcAuthenticationService =
      dependencies.authenticationServiceRegistry.lookupAuthenticationService(identityProvider);

    const result = await usecases.reconcileOidcUser({
      authenticationKey,
      oidcAuthenticationService,
    });

    return h.response({ access_token: result.accessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
  },

  async getAuthenticationUrl(
    request,
    h,
    dependencies = {
      authenticationServiceRegistry,
    }
  ) {
    const { identity_provider: identityProvider } = request.query;
    const oidcAuthenticationService =
      dependencies.authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const result = oidcAuthenticationService.getAuthenticationUrl({ redirectUri: request.query['redirect_uri'] });
    return h.response(result).code(200);
  },

  async authenticateUser(
    request,
    h,
    dependencies = {
      authenticationServiceRegistry,
    }
  ) {
    const { code, identityProvider, redirectUri, stateSent, stateReceived } = request.deserializedPayload;

    const oidcAuthenticationService =
      dependencies.authenticationServiceRegistry.lookupAuthenticationService(identityProvider);

    const result = await usecases.authenticateOidcUser({
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
      const { authenticationKey, givenName, familyName } = result;
      const meta = { authenticationKey, givenName, familyName };
      throw new UnauthorizedError(message, responseCode, meta);
    }
  },

  async createUser(
    request,
    h,
    dependencies = {
      authenticationServiceRegistry,
    }
  ) {
    const { identityProvider, authenticationKey } = request.deserializedPayload;
    const localeFromCookie = request.state?.locale;

    const oidcAuthenticationService =
      dependencies.authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const { accessToken, logoutUrlUUID } = await usecases.createOidcUser({
      authenticationKey,
      identityProvider,
      localeFromCookie,
      oidcAuthenticationService,
    });

    const response = { access_token: accessToken, logout_url_uuid: logoutUrlUUID };
    return h.response(response).code(200);
  },
};
