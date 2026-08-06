import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToCreateCampaignError } from '../errors.js';

export const createCampaign = withTransaction(async function ({
  campaign,
  membershipRepository,
  campaignAdministrationRepository,
  accessCodeRepository,
  campaignCreatorRepository,
  accessCodeGenerator,
  options,
}) {
  const userId = campaign.creatorId;
  const ownerId = campaign.ownerId;
  const organizationId = campaign.organizationId;

  await _checkUserIsAMemberOfOrganization({ membershipRepository, organizationId, userId });
  await _checkUserIsAMemberOfOrganization({ membershipRepository, organizationId, userId: ownerId });

  const generatedCampaignCode = await accessCodeGenerator.generateAvailableAccessCode((code) =>
    accessCodeRepository.isCodeAvailable({ code }),
  );

  const campaignCreator = await campaignCreatorRepository.get(organizationId);
  const campaignForCreation = campaignCreator.createCampaign(
    {
      ...campaign,
      code: generatedCampaignCode,
    },
    options,
  );

  return campaignAdministrationRepository.save(campaignForCreation);
});

async function _checkUserIsAMemberOfOrganization({ membershipRepository, organizationId, userId }) {
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId });

  if (memberships.length === 0) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}
