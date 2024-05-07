/**
 * @typedef {function} getReadyIdentityProviders
 * @param {Object} params
 * @param {string} [params.audience=app]
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getReadyIdentityProviders = async function ({ audience = 'app', oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

  if (audience === 'admin') {
    return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }

  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
