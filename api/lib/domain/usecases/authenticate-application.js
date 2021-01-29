const {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
} = require('../../domain/errors');

const { find } = require('lodash');
const { graviteeRegisterApplicationsCredentials, livretScolaireAuthentication } = require('../../config');

function _checkClientId(application, clientId) {

  if (!application || application.clientId !== clientId) {
    throw new ApplicationWithInvalidClientIdError('The client ID is invalid.');
  }
}

function _checkClientSecret(application, clientSecret) {
  if (application.clientSecret !== clientSecret) {
    throw new ApplicationWithInvalidClientSecretError('The client secret is invalid.');
  }
}

function _checkAppScope(application, scope) {
  if (application.scope !== scope) {
    throw new ApplicationScopeNotAllowedError('The scope is invalid.');
  }
}

module.exports = async function authenticateApplication({
  clientId,
  clientSecret,
  scope,
  tokenService,
}) {
  const application = find(graviteeRegisterApplicationsCredentials, { clientId });
  _checkClientId(application, clientId);
  _checkClientSecret(application, clientSecret);
  _checkAppScope(application, scope);

  return tokenService.createAccessTokenFromApplication(clientId, application.source, scope, livretScolaireAuthentication.secret, livretScolaireAuthentication.tokenLifespan);

};
