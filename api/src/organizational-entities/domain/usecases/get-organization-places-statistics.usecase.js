import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { PlacesStatistics } from '../read-models/PlacesStatistics.js';

/**
 * @function
 * @name getOrganizationPlacesStatistics
 * @typedef {object} payload
 * @property {number} organizationId
 * @property {organizationPlacesLotRepository} organizationPlacesLotRepository
 * @property {organizationLearnerRepository} organizationLearnerRepository
 * @property {organizationFeatureRepository} organizationFeatureRepository
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

/**
 * @typedef {object} organizationFeatureRepository
 * @property {function} findAllOrganizationFeaturesFromOrganizationId
 */
const getOrganizationPlacesStatistics = async function ({
  organizationId,
  organizationPlacesLotRepository,
  organizationLearnerRepository,
  organizationFeatureRepository,
}) {
  if (!organizationId) {
    throw new Error('You must provide at least one organizationId.');
  }

  const placesLots = await organizationPlacesLotRepository.findAllByOrganizationIds({
    organizationIds: [organizationId],
  });

  const placeRepartition =
    await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationId(organizationId);

  const organizationFeatures = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
    organizationId,
  });

  const placesManagementFeature = organizationFeatures.find(
    (feature) => feature.name === ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
  );
  const isMaximumPlacesLimitEnabled = placesManagementFeature?.params?.enableMaximumPlacesLimit;

  return PlacesStatistics.buildFrom({
    placesLots,
    placeRepartition,
    organizationId,
    enableMaximumPlacesLimit: isMaximumPlacesLimitEnabled,
  });
};

export { getOrganizationPlacesStatistics };
