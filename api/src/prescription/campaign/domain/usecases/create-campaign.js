import { UserNotAuthorizedToCreateCampaignError } from '../../../../../lib/domain/errors.js';

const createCampaign = async function ({
  campaign,
  userRepository,
  campaignAdministrationRepository,
  campaignCreatorRepository,
  codeGenerator,
}) {
  const userId = campaign.creatorId;
  const ownerId = campaign.ownerId;
  const organizationId = campaign.organizationId;

  await _checkUserIsAMemberOfOrganization({ userRepository, organizationId, userId });
  await _checkUserIsAMemberOfOrganization({ userRepository, organizationId, userId: ownerId });

  const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);

  const campaignCreator = await campaignCreatorRepository.get(organizationId);

  const campaignForCreation = campaignCreator.createCampaign({ ...campaign, code: generatedCampaignCode });

  return campaignAdministrationRepository.save(campaignForCreation);
};

async function _checkUserIsAMemberOfOrganization({ userRepository, organizationId, userId }) {
  const userWithMemberships = await userRepository.getWithMemberships(userId);

  if (!userWithMemberships.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

export { createCampaign };
