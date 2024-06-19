import {
  CampaignCodeError,
  OrganizationLearnerDisabledError,
  UserNotAuthorizedToAccessEntityError,
} from '../../../../../lib/domain/errors.js';

const findAssociationBetweenUserAndOrganizationLearner = async function ({
  authenticatedUserId,
  requestedUserId,
  campaignCode,
  campaignRepository,
  registrationOrganizationLearnerRepository,
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const organizationLearner = await registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId: authenticatedUserId,
    organizationId: campaign.organizationId,
  });

  if (organizationLearner && organizationLearner.isDisabled) {
    throw new OrganizationLearnerDisabledError();
  }

  return organizationLearner;
};

export { findAssociationBetweenUserAndOrganizationLearner };
