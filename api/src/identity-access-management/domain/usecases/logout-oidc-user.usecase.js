/**
 * @typedef {function} logoutOidcUser
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.identityProvider
 * @param {string} params.requestedApplication
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @param {refreshTokenRepository} params.refreshTokenRepository
 * @return {Promise<string>}
 */
async function logoutOidcUser({
  userId,
  identityProvider,
  requestedApplication,
  logoutUrlUUID,
  oidcAuthenticationServiceRegistry,
}) {
  // Revoke user AccessToken
  //temporarily pause revoke user access token to fix SSO bugs
  /*await revokedUserAccessRepository.revokeAll({
    userId,
    revokeUntil: new Date(),
  });*/

  // Revoke user RefreshToken
  //temporarily pause revoke user refresh token to fix SSO bugs
  /*
  await refreshTokenRepository.revokeAllByUserId({ userId });
*/

  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  if (!oidcAuthenticationService.shouldCloseSession) return;

  const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({
    logoutUrlUUID,
    userId,
  });

  return redirectLogoutUrl;
}

export { logoutOidcUser };
