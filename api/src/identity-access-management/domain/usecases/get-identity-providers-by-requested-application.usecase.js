/**
 * @typedef {function} getIdentityProvidersByRequestedApplication
 * @param {Object} params
 * @param {RequestedApplication} params.requestedApplication
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getIdentityProvidersByRequestedApplication = async function ({
  requestedApplication,
  oidcAuthenticationServiceRegistry,
}) {
  return oidcAuthenticationServiceRegistry.getOidcProviderServicesByRequestedApplication(requestedApplication);
};

export { getIdentityProvidersByRequestedApplication };
