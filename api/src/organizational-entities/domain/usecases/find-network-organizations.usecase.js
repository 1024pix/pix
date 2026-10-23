/**
 * @param {object} params
 * @param {number} params.networkId
 * @param {NetworkRepository} params.networkRepository
 * @returns {Promise<Array<{organizationId: number, externalId: string|null}>>}
 */
async function findNetworkOrganizations({ networkId, networkRepository }) {
  return networkRepository.findOrganizationsByNetworkId({ networkId });
}

export { findNetworkOrganizations };
