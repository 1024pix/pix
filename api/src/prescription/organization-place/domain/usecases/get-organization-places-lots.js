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
 * @property {function} findAllByOrganizationId
 */

const getOrganizationPlacesLots = async function ({ organizationId, organizationPlacesLotRepository }) {
  return await organizationPlacesLotRepository.findAllNotDeletedByOrganizationId(organizationId);
};

export { getOrganizationPlacesLots };
