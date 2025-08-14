import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as injectedOrganizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot-repository.js';
import { DataOrganizationPlacesStatistics } from '../read-models/DataOrganizationPlacesStatistics.js';
import { PlaceStatistics } from '../read-models/PlaceStatistics.js';

const getDataOrganizationsPlacesStatistics = withTransaction(async function ({
  organizationRepository = injectedOrganizationRepository,
  organizationPlacesLotRepository = injectedOrganizationPlacesLotRepository,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
} = {}) {
  const organizationWithPlaces = await organizationRepository.getOrganizationsWithPlacesManagementFeatureEnabled();

  const organizationWithPlacesIds = organizationWithPlaces.map((organization) => organization.id);

  const placesLots = await organizationPlacesLotRepository.findAllByOrganizationIds({
    organizationIds: organizationWithPlacesIds,
  });

  const placeRepartitions =
    await organizationLearnerRepository.findAllLearnerWithAtLeastOneParticipationByOrganizationIds(
      organizationWithPlacesIds,
    );

  return organizationWithPlaces.map((organization) => {
    const placeStatistics = PlaceStatistics.buildFrom({
      placesLots: placesLots.filter((place) => place.organizationId === organization.id),
      placeRepartition: placeRepartitions[organization.id],
      organizationId: organization.id,
    });
    return new DataOrganizationPlacesStatistics({ placeStatistics, organization });
  });
});

export { getDataOrganizationsPlacesStatistics };
