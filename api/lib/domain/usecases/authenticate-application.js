const {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
} = require('../../domain/errors');

const { credentialLivretScolaireGraviteeApplication, livretScolaireAuthentication } = require('../../config');

function _checkClientId(clientId) {

  if (clientId !== credentialLivretScolaireGraviteeApplication.clientId) {
    throw new ApplicationWithInvalidClientIdError('The client ID is invalid.');
  }
}

function _checkClientSecret(clientSecret) {
  if (clientSecret !== credentialLivretScolaireGraviteeApplication.clientSecret) {
    throw new ApplicationWithInvalidClientSecretError('The client secret is invalid.');
  }
}

function _checkAppScope(scope) {
  if (scope !== credentialLivretScolaireGraviteeApplication.scope) {
    throw new ApplicationScopeNotAllowedError('The scope is invalid.');
  }
}

module.exports = async function authenticateApplication({
  clientId,
  clientSecret,
  scope,
  tokenService,
}) {
  _checkClientId(clientId);
  _checkClientSecret(clientSecret);
  _checkAppScope(scope);

  return tokenService.createAccessTokenFromApplication(clientId, credentialLivretScolaireGraviteeApplication.source, scope, livretScolaireAuthentication.secret, livretScolaireAuthentication.tokenLifespan);

};
