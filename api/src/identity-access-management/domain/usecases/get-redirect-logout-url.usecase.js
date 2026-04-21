/**
 * @typedef {function} getRedirectLogoutUrl
 * @param {Object} params
 * @param {string} params.identityProvider - The OIDC identity provider code
 * @param {string} params.logoutUrlUUID - UUID for the logout URL
 * @param {string} params.userId - The ID of the user logging out
 * @param {string} params.requestedApplication - The application requesting the logout
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string>} The redirect logout URL
 */
async function getRedirectLogoutUrl({
  identityProvider,
  logoutUrlUUID,
  userId,
  requestedApplication,
  oidcAuthenticationServiceRegistry,
}) {
  const oidcAuthenticationService = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  return oidcAuthenticationService.getRedirectLogoutUrl({
    logoutUrlUUID,
    userId,
  });
}

export { getRedirectLogoutUrl };
