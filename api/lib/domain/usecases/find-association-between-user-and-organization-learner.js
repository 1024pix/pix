import {
  CampaignCodeError,
  UserNotAuthorizedToAccessEntityError,
  OrganizationLearnerDisabledError,
} from '../errors.js';

const findAssociationBetweenUserAndOrganizationLearner = async function ({
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
};

export { findAssociationBetweenUserAndOrganizationLearner };
