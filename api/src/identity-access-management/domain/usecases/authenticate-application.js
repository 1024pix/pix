import { config } from '../../../shared/config.js';
import {
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidCredentialsError,
} from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const { authentication } = config;
const logger = child('iam:applicationauth', { event: SCOPES.IAM });

export async function authenticateApplication({
  clientId,
  clientSecret,
  scope,
  tokenService,
  clientApplicationRepository,
  cryptoService,
}) {
  const application = await clientApplicationRepository.findByClientId(clientId);
  _checkApplication(application, clientId);
  await _checkClientSecret(application, clientSecret, cryptoService);
  _checkAppScope(application, scope);

  return tokenService.createAccessTokenFromApplication(
    clientId,
    application.name,
    scope,
    authentication.secret,
    authentication.accessTokenLifespanMs,
  );
}

function _checkApplication(application, clientId) {
  if (!application) {
    logger.warn({ clientId }, 'The client ID is invalid.');
    throw new ApplicationWithInvalidCredentialsError();
  }
}

async function _checkClientSecret(application, clientSecret, cryptoService) {
  try {
    await cryptoService.checkPassword({ password: clientSecret, passwordHash: application.clientSecret });
  } catch {
    logger.warn({ clientId: application.clientId }, 'The client secret is invalid.');
    throw new ApplicationWithInvalidCredentialsError();
  }
}

function _checkAppScope(application, scope) {
  const requestedScopes = scope.split(/\s/g);

  for (const requestedScope of requestedScopes) {
    if (!application.scopes.includes(requestedScope)) {
      throw new ApplicationScopeNotAllowedError();
    }
  }
}
