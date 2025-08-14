import { oidcAuthenticationServiceRegistry as injectedOidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js'; /**
 * @typedef {function} getAllIdentityProviders
 * @param {Object} params
 * @param {OidcAuthenticationServiceRegistry} params.oidcAuthenticationServiceRegistry
 * @return {Promise<OidcAuthenticationService[]|null>}
 */
const getAllIdentityProviders = async function ({
  oidcAuthenticationServiceRegistry = injectedOidcAuthenticationServiceRegistry,
} = {}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  return oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
