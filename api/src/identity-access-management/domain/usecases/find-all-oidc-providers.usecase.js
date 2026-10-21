/**
 * @param {Object} params
 * @param {typeof import("../../infrastructure/repositories/oidc-provider-repository.js").oidcProviderRepository} params.oidcProviderRepository
 * @return {Promise<Array<import("../models/OidcProvider.js").OidcProvider>>}
 */
export async function findAllOidcProviders({ oidcProviderRepository }) {
  return oidcProviderRepository.findAllOidcProviders();
}
