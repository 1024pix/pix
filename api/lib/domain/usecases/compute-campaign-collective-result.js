const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignCollectiveResult(
  {
    userId,
    campaignId,
    view = 'competence',
    campaignRepository,
    campaignCollectiveResultRepository,
    competenceRepository,
    tubeRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  if (view === 'tube') {
    const tubes = await tubeRepository.list();
    return campaignCollectiveResultRepository.getCampaignCollectiveResultByTube(campaignId, tubes);
  }

  const competences = await competenceRepository.list();
  return campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence(campaignId, competences);
};
