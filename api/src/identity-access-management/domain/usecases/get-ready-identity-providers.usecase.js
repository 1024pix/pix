/**
 * @typedef {function} getReadyIdentityProviders
 * @param {Object} params
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getReadyIdentityProviders = async function ({ oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
};

export { getReadyIdentityProviders };
