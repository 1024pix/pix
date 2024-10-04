import { CampaignTypes } from '../../../shared/domain/constants.js';

const createCampaigns = async function ({
  campaignsToCreate,
  campaignAdministrationRepository,
  campaignCreatorRepository,
  codeGenerator,
  userRepository,
  organizationRepository,
}) {
  const enrichedCampaignsData = await Promise.all(
    campaignsToCreate.map(async (campaign) => {
      await _checkIfOwnerIsExistingUser(userRepository, campaign.ownerId);
      await _checkIfOrganizationExists(organizationRepository, campaign.organizationId);

      const generatedCampaignCode = await codeGenerator.generate(campaignAdministrationRepository);
      const campaignCreator = await campaignCreatorRepository.get(campaign.organizationId);

      return campaignCreator.createCampaign({
        ...campaign,
        type: CampaignTypes.ASSESSMENT,
        code: generatedCampaignCode,
      });
    }),
  );

  return campaignAdministrationRepository.save(enrichedCampaignsData);
};

const _checkIfOwnerIsExistingUser = async function (userRepository, userId) {
  await userRepository.get(userId);
};

const _checkIfOrganizationExists = async function (organizationRepository, organizationId) {
  await organizationRepository.get(organizationId);
};

export { createCampaigns };
