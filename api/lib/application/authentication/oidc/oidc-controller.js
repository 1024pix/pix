const authenticationServiceRegistry = require('../../../domain/services/authentication/authentication-service-registry');

module.exports = {
  async getRedirectLogoutUrl(request, h) {
    const userId = request.auth.credentials.userId;
    const {
      identity_provider: identityProvider,
      redirect_uri: redirectUri,
      logout_url_uuid: logoutUrlUUID,
    } = request.query;
    const oidcAuthenticationService = authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
    const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({
      userId,
      logoutUrlUUID,
      redirectUri,
    });

    return h.response({ redirectLogoutUrl }).code(200);
  },
};
