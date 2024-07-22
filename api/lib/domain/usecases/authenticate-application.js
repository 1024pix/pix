import lodash from 'lodash';

import {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
} from '../../../src/shared/domain/errors.js';

const { find } = lodash;

import { config } from '../../../src/shared/config.js';
const { apimRegisterApplicationsCredentials, jwtConfig } = config;

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

const authenticateApplication = async function ({ clientId, clientSecret, scope, tokenService }) {
  const application = find(apimRegisterApplicationsCredentials, { clientId });
  _checkClientId(application, clientId);
  _checkClientSecret(application, clientSecret);
  _checkAppScope(application, scope);

  return tokenService.createAccessTokenFromApplication(
    clientId,
    application.source,
    scope,
    jwtConfig[application.source].secret,
    jwtConfig[application.source].tokenLifespan,
  );
};

export { authenticateApplication };
