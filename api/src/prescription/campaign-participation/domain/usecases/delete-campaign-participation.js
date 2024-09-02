const deleteCampaignParticipation = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignParticipationRepository,
}) {
  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForASameLearner({
      campaignId,
      campaignParticipationId,
    });

  for (const campaignParticipation of campaignParticipations) {
    campaignParticipation.delete(userId);
    const { id, deletedAt, deletedBy } = campaignParticipation;
    await campaignParticipationRepository.remove({ id, deletedAt, deletedBy });
  }
};

export { deleteCampaignParticipation };
