import {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
} from '../../domain/errors';

import { find } from 'lodash';
import { graviteeRegisterApplicationsCredentials, jwtConfig } from '../../config';

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

export default async function authenticateApplication({ clientId, clientSecret, scope, tokenService }) {
  const application = find(graviteeRegisterApplicationsCredentials, { clientId });
  _checkClientId(application, clientId);
  _checkClientSecret(application, clientSecret);
  _checkAppScope(application, scope);

  return tokenService.createAccessTokenFromApplication(
    clientId,
    application.source,
    scope,
    jwtConfig[application.source].secret,
    jwtConfig[application.source].tokenLifespan
  );
}
