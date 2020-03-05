const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignCollectiveResult(
  {
    userId,
    campaignId,
    campaignRepository,
    campaignCollectiveResultRepository,
    competenceRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const competences = await competenceRepository.list();

  return campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);
};
