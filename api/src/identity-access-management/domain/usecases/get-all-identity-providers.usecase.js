/**
 * @param {Object} params
 * @param {OidcProviderRepository} params.oidcProviderRepository
 * @return {Promise<Array<OidcProvider>>}
 */
const getAllIdentityProviders = async function ({ oidcProviderRepository }) {
  return oidcProviderRepository.findAllOidcProviders();
};

export { getAllIdentityProviders };
