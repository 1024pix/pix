import { PlaceStatistics } from '../read-models/PlaceStatistics.js';

/**
 * @function
 * @name getOrganizationPlacesStatistics
 * @typedef {object} payload
 * @property {number} organizationId
 * @property {organizationPlacesLotRepository} organizationPlacesLotRepository
 * @property {organizationLearnerRepository} organizationLearnerRepository
 * @returns {Promise<Array<PlaceStatistics>>}
 */

/**
 * @typedef {object} organizationPlacesLotRepository
 * @property {function} findAllByOrganizationId
 */

/**
 * @typedef {object} organizationLearnerRepository
 * @property {function} findAllLearnerWithAtLeastOneParticipationByOrganizationId
 */

const getOrganizationPlacesStatistics = async function ({
  organizationId,
  organizationPlacesLotRepository,
  organizationLearnerRepository,
}) {
  const placesLots = await organizationPlacesLotRepository.findAllByOrganizationId(organizationId);

  const placeRepartition =
    await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

  return PlaceStatistics.buildFrom({
    placesLots,
    placeRepartition,
    organizationId,
  });
};

export { getOrganizationPlacesStatistics };
