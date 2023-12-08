import { PlaceStatistics } from '../read-models/PlaceStatistics.js';

const getOrganizationPlacesStatistics = async function ({
  organizationId,
  organizationPlacesLotRepository,
  organizationLearnerRepository,
}) {
  const placesLots = await organizationPlacesLotRepository.findAllByOrganizationId(organizationId);

  const activeWithAtLeastOneParticipationLearners =
    await organizationLearnerRepository.countActiveWithAtLeastOneParticipationByOrganizationId(organizationId);

  return PlaceStatistics.buildFrom({
    placesLots,
    numberOfParticipantWithAtLeastOneParticipation: activeWithAtLeastOneParticipationLearners,
    organizationId,
  });
};

export { getOrganizationPlacesStatistics };
