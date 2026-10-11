/**
 * @param {Object} params
 * @param {OidcProviderRepository} params.oidcProviderRepository
 * @return {Promise<Array<OidcProvider>>}
 */
export async function getAllIdentityProviders({ oidcProviderRepository }) {
  return oidcProviderRepository.findAllOidcProviders();
}
