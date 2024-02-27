const saveComputedCampaignParticipationResult = async function ({
  participantResultsSharedRepository,
  campaignParticipationId,
}) {
  const participantResultsShared = await participantResultsSharedRepository.get(campaignParticipationId);
  return participantResultsSharedRepository.save(participantResultsShared);
};

export { saveComputedCampaignParticipationResult };
