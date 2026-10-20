import { config } from '../../../../config/config.js';

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.sessionId
 * @param {string} params.identityProvider
 * @param {string} params.logoutUrlUUID
 * @param {string} params.requestedApplication
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string|undefined>}
 */
async function logoutOidcUser({
  userId,
  sessionId,
  identityProvider,
  logoutUrlUUID,
  requestedApplication,
  oidcAuthenticationServiceRegistry,
  revokedUserAccessRepository,
}) {
  const revokeUntil = new Date(Date.now() + config.authentication.revokedUserAccessLifespanMs);
  await revokedUserAccessRepository.revokeSession({ userId, sessionId, revokeUntil });

  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  if (!oidcAuthenticationService.shouldCloseSession) {
    return;
  }

  const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });
  return redirectLogoutUrl;
}

export { logoutOidcUser };
