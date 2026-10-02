/**
 * @param {object} params
 * @param {number} params.networkId
 * @param {NetworkRepository} params.networkRepository
 * @returns {Promise<Array<number>>}
 */
async function findNetworkOrganizations({ networkId, networkRepository }) {
  return networkRepository.findOrganizationIdsByNetworkId({ networkId });
}

export { findNetworkOrganizations };
