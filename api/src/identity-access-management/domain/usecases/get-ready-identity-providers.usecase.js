import { oidcAuthenticationServiceRegistry as injectedOidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js'; /**
 * @typedef {function} getReadyIdentityProviders
 * @param {Object} params
 * @param {RequestedApplication} params.requestedApplication
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getReadyIdentityProviders = async function ({
  requestedApplication,
  oidcAuthenticationServiceRegistry = injectedOidcAuthenticationServiceRegistry,
} = {}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

  if (requestedApplication?.isPixAdmin) {
    return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }

  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
