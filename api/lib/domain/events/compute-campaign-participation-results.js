const CampaignParticipationResultShared = require('./CampaignParticipationResultsShared');

module.exports = async function computeCampaignParticipationResults({
  event,
  participantResultsSharedRepository,
  campaignParticipationRepository,
}) {
  const { campaignParticipationId } = event;
  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  await campaignParticipationRepository.update(participantResultsShared);
};

module.exports.eventTypes = [CampaignParticipationResultShared];
