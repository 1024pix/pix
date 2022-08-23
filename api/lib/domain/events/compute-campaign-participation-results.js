const CampaignParticipationResultShared = require('./CampaignParticipationResultsShared');

module.exports = async function computeCampaignParticipationResults({ event, participantResultsSharedRepository }) {
  const { campaignParticipationId } = event;
  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  await participantResultsSharedRepository.save(participantResultsShared);
};

module.exports.eventTypes = [CampaignParticipationResultShared];
