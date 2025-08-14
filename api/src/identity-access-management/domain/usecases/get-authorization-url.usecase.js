import { oidcAuthenticationServiceRegistry as injectedOidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js'; /**
 * @typedef {function} getAuthorizationUrl
 * @param {Object} params
 * @param {string} params.identityProvider
 * @param {RequestedApplication} params.requestedApplication
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<string>}
 */
async function getAuthorizationUrl({
  identityProvider,
  requestedApplication,
  oidcAuthenticationServiceRegistry = injectedOidcAuthenticationServiceRegistry,
} = {}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  return oidcAuthenticationService.getAuthorizationUrl();
}

export { getAuthorizationUrl };
