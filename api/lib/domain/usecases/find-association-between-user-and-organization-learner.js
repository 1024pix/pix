import { CampaignCodeError, UserNotAuthorizedToAccessEntityError, OrganizationLearnerDisabledError } from '../errors';

export default async function findAssociationBetweenUserAndOrganizationLearner({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  organizationLearnerRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const organizationLearner = await organizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId: authenticatedUserId,
    organizationId: campaign.organizationId,
  });

  if (organizationLearner && organizationLearner.isDisabled) {
    throw new OrganizationLearnerDisabledError();
  }

  return organizationLearner;
}
