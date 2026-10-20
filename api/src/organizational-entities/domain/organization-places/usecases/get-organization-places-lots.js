/**
 * @function
 * @name getOrganizationPlacesLots
 * @typedef {object} payload
 * @property {number} organizationId
 * @property {organizationPlacesLotRepository} organizationPlacesLotRepository
 * @returns {Promise<Array<PlacesLots>>}
 */

/**
 * @typedef {object} organizationPlacesLotRepository
 * @property {function} findAllByOrganizationIds
 */

const getOrganizationPlacesLots = async function ({ organizationId, organizationPlacesLotRepository }) {
  if (!organizationId) {
    throw new Error('You must provide at least one organizationId.');
  }

  return organizationPlacesLotRepository.findAllByOrganizationIds({
    organizationIds: [organizationId],
    callOrderByAndRemoveDeleted: true,
  });
};

export { getOrganizationPlacesLots };
