import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignTypes } from '../../../shared/domain/constants.js';

const createCampaigns = withTransaction(async function ({
  campaignsToCreate,
  options,
  campaignAdministrationRepository,
  accessCodeRepository,
  campaignCreatorRepository,
  accessCodeGenerator,
  userRepository,
  organizationRepository,
}) {
  const enrichedCampaignsData = [];
  for (const campaign of campaignsToCreate) {
    await _checkIfOwnerIsExistingUser(userRepository, campaign.ownerId);
    await _checkIfOrganizationExists(organizationRepository, campaign.organizationId);

    const generatedCampaignCode = await accessCodeGenerator.generateAvailableAccessCode((code) =>
      accessCodeRepository.isCodeAvailable({ code }),
    );
    const campaignCreator = await campaignCreatorRepository.get(campaign.organizationId);

    const campaignToCreate = await campaignCreator.createCampaign(
      {
        organizationId: campaign.organizationId,
        ownerId: campaign.ownerId,
        name: campaign.name,
        title: campaign.title,
        type: campaign.type ?? CampaignTypes.ASSESSMENT,
        targetProfileId: campaign.targetProfileId,
        creatorId: campaign.creatorId,
        customLandingPageText: campaign.customLandingPageText,
        externalIdLabel: campaign.externalIdLabel,
        externalIdType: campaign.externalIdType,
        multipleSendings: campaign.multipleSendings,
        customResultPageText: campaign.customResultPageText,
        customResultPageButtonText: campaign.customResultPageButtonText,
        customResultPageButtonUrl: campaign.customResultPageButtonUrl,
        code: generatedCampaignCode,
      },
      options,
    );
    enrichedCampaignsData.push(campaignToCreate);
  }
  return campaignAdministrationRepository.save(enrichedCampaignsData);
});

const _checkIfOwnerIsExistingUser = async function (userRepository, userId) {
  await userRepository.get(userId);
};

const _checkIfOrganizationExists = async function (organizationRepository, organizationId) {
  await organizationRepository.get(organizationId);
};

export { createCampaigns };
