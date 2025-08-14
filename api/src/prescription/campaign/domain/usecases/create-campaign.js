import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as injectedCodeGenerator from '../../../../shared/domain/services/code-generator.js';
import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as injectedCampaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
import { UserNotAuthorizedToCreateCampaignError } from '../errors.js';

const createCampaign = async function ({
  campaign,
  userRepository = injectedUserRepository,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
  campaignCreatorRepository = injectedCampaignCreatorRepository,
  codeGenerator = injectedCodeGenerator,
} = {}) {
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
