/**
 * @typedef {function} getUnauthenticatedRedirectLogoutUrl
 * @param {Object} params
 * @param {string} params.identityProvider
 * @param {string} params.idTokenHint
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string>}
 */
async function getUnauthenticatedRedirectLogoutUrl({
  identityProvider,
  idTokenHint,
  oidcAuthenticationServiceRegistry,
}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });

  return oidcAuthenticationService.getUnauthenticatedRedirectLogoutUrl({
    idTokenHint,
  });
}

export { getUnauthenticatedRedirectLogoutUrl };
