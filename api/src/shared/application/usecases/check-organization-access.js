import { getAllFeaturesFromOrganization } from '../../../organizational-entities/application/api/organization-features-api.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { usecases as prescriptionUsecases } from '../../../prescription/organization-place/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../constants.js';
import { ForbiddenAccess } from '../../domain/errors.js';

const execute = async function ({
  organizationId,
  campaignId,
  campaignParticipationId,
  dependencies = { campaignRepository, getAllFeaturesFromOrganization },
}) {
  let organizationIdToUse = organizationId;

  if (!organizationIdToUse && campaignId) {
    const campaign = await dependencies.campaignRepository.get(campaignId);
    organizationIdToUse = campaign.organizationId;
  } else if (!campaignId && campaignParticipationId) {
    const campaign = await dependencies.campaignRepository.getByCampaignParticipationId(campaignParticipationId);
    organizationIdToUse = campaign.organizationId;
  }

  if (!organizationIdToUse) {
    throw new Error('No organization to check');
  }

  const { features } = await dependencies.getAllFeaturesFromOrganization(organizationIdToUse);

  const placesManagementFeature = features.find(
    (feature) => feature.name === ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
  );
  const hasMaximumPlacesLimitEnabled = placesManagementFeature?.params?.enableMaximumPlacesLimit;

  if (!hasMaximumPlacesLimitEnabled) return true;

  const placesStatistics = await prescriptionUsecases.getOrganizationPlacesStatistics({
    organizationId: organizationIdToUse,
  });

  if (placesStatistics.hasReachedMaximumPlacesLimit) {
    throw new ForbiddenAccess('Maximum places reached', 'MAXIMUM_PLACES_REACHED');
  }

  return true;
};

export { execute };
