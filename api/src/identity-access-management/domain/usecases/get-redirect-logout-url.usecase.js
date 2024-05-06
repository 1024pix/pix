/**
 * @typedef {function} getRedirectLogoutUrl
 * @param {Object} params
 * @param {string} params.identityProvider
 * @param {string} params.logoutUrlUUID
 * @param {string} params.userId
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string>}
 */
async function getRedirectLogoutUrl({ identityProvider, logoutUrlUUID, userId, oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });

  return oidcAuthenticationService.getRedirectLogoutUrl({
    logoutUrlUUID,
    userId,
  });
}

export { getRedirectLogoutUrl };
