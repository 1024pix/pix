/**
 * @typedef {function} getAuthorizationUrl
 * @param {Object} params
 * @param {string} params.audience
 * @param {string} params.identityProvider
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string>}
 */
async function getAuthorizationUrl({ audience, identityProvider, oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience,
  });

  return oidcAuthenticationService.getAuthorizationUrl();
}

export { getAuthorizationUrl };
