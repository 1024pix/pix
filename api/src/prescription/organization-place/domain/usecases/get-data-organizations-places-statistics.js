import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DataOrganizationPlacesStatistics } from '../read-models/DataOrganizationPlacesStatistics.js';

const getDataOrganizationsPlacesStatistics = withTransaction(async function ({
  organizationRepository,
  getOrganizationPlacesStatistics,
}) {
  const organizationWithPlaces = await organizationRepository.getOrganizationsWithPlaces();

  return Promise.all(
    organizationWithPlaces.map(async (organization) => {
      const placeStatistics = await getOrganizationPlacesStatistics({ organizationId: organization.id });
      return new DataOrganizationPlacesStatistics({ placeStatistics, organization });
    }),
  );
});

export { getDataOrganizationsPlacesStatistics };
