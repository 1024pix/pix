const updateParticipantExternalId = async function ({
  campaignParticipationId,
  participantExternalId,
  participationsForCampaignManagementRepository,
}) {
  await participationsForCampaignManagementRepository.updateParticipantExternalId({
    campaignParticipationId,
    participantExternalId,
  });
};

export { updateParticipantExternalId };
