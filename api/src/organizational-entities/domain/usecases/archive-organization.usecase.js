import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ArchiveOrganizationError } from '../errors.js';
import { statuses } from '../read-models/PlacesLot.js';

const archiveOrganization = withTransaction(async function ({
  organizationId,
  userId,
  campaignsApi,
  learnersApi,
  organizationForAdminRepository,
  organizationPlacesLotRepository,
}) {
  const organizationPlacesLots = await organizationPlacesLotRepository.findAllByOrganizationIds({
    organizationIds: [organizationId],
  });

  if (_organizationIsNotArchivable(organizationPlacesLots)) {
    throw new ArchiveOrganizationError({
      message: 'Organization with either active or pending lots cannot be archived',
    });
  }

  await organizationForAdminRepository.archive({ id: organizationId, archivedBy: userId });

  await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId });
  await campaignsApi.deleteActiveCampaigns({ userId, organizationId });

  return await organizationForAdminRepository.get({ organizationId });
});

const _organizationIsNotArchivable = (organizationPlacesLots) => {
  return Boolean(
    organizationPlacesLots.find(
      (organizationPlacesLot) => organizationPlacesLot.isActive || organizationPlacesLot.status === statuses.PENDING,
    ),
  );
};

export { archiveOrganization };
