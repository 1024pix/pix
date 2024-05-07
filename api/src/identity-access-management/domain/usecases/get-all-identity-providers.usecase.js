/**
 * @typedef {function} getAllIdentityProviders
 * @param {Object} params
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getAllIdentityProviders = async function ({ oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  return oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
