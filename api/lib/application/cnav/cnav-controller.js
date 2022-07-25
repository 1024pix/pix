const usecases = require('../../domain/usecases');
const userRepository = require('../../infrastructure/repositories/user-repository');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const authenticationRegistry = require('../../domain/services/authentication/authentication-service-registry');

module.exports = {
  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId } = await usecases.createUserFromExternalIdentityProvider({
      authenticationKey,
      identityProvider: AuthenticationMethod.identityProviders.CNAV,
    });

    const { oidcAuthenticationService } = authenticationRegistry.lookupAuthenticationService(
      AuthenticationMethod.identityProviders.CNAV
    );
    const accessToken = oidcAuthenticationService.createAccessToken(userId);
    await userRepository.updateLastLoggedAt({ userId });

    const response = { access_token: accessToken };
    return h.response(response).code(200);
  },

  async getAuthenticationUrl(request, h) {
    const { oidcAuthenticationService } = authenticationRegistry.lookupAuthenticationService(
      AuthenticationMethod.identityProviders.CNAV
    );
    const result = oidcAuthenticationService.getAuthenticationUrl({
      redirectUri: request.query['redirect_uri'],
    });
    return h.response(result).code(200);
  },
};
