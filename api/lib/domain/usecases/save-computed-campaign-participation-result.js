module.exports = async function saveComputedCampaignParticipationResult({
  participantResultsSharedRepository,
  campaignParticipationId,
}) {
  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  return participantResultsSharedRepository.save(participantResultsShared);
};
