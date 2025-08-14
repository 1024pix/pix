import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as injectedCodeGenerator from '../../../../shared/domain/services/code-generator.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignAdministrationRepository from '../../infrastructure/repositories/campaign-administration-repository.js';
import * as injectedCampaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
const createCampaigns = async function ({
  campaignsToCreate,
  campaignAdministrationRepository = injectedCampaignAdministrationRepository,
  campaignCreatorRepository = injectedCampaignCreatorRepository,
  codeGenerator = injectedCodeGenerator,
  userRepository = injectedUserRepository,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  const enrichedCampaignsData = [];
  for (const campaign of campaignsToCreate) {
    await _checkIfOwnerIsExistingUser(userRepository, campaign.ownerId);
    await _checkIfOrganizationExists(organizationRepository, campaign.organizationId);

    const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);
    const campaignCreator = await campaignCreatorRepository.get(campaign.organizationId);

    const campaignToCreate = await campaignCreator.createCampaign({
      ...campaign,
      code: generatedCampaignCode,
    });
    enrichedCampaignsData.push(campaignToCreate);
  }
  return campaignAdministrationRepository.save(enrichedCampaignsData);
};

const _checkIfOwnerIsExistingUser = async function (userRepository, userId) {
  await userRepository.get(userId);
};

const _checkIfOrganizationExists = async function (organizationRepository, organizationId) {
  await organizationRepository.get(organizationId);
};

export { createCampaigns };
