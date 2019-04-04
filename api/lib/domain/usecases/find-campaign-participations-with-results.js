const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findCampaignParticipationsWithResults({
  userId,
  options,
  campaignRepository,
  competenceRepository,
  targetProfileRepository,
  campaignParticipationRepository,
}) {
  const campaignId = options.filter.campaignId;

  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  const [ campaignParticipations, targetProfile, competences ] = await Promise.all([
    campaignParticipationRepository.findWithCampaignParticipationResultsData(options),
    targetProfileRepository.getByCampaignId(campaignId),
    competenceRepository.list(),
  ]);

  for (const campaignParticipation of campaignParticipations.models) {
    const { assessment } = campaignParticipation;
    const { user: { knowledgeElements } } = campaignParticipation;

    campaignParticipation.addCampaignParticipationResult({ competences, targetProfile, assessment, knowledgeElements });
  }

  return campaignParticipations;

};
