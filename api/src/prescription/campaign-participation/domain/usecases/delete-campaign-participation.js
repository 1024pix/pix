import bluebird from 'bluebird';

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

  await bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {
    campaignParticipation.delete(userId);
    const { id, deletedAt, deletedBy } = campaignParticipation;
    await campaignParticipationRepository.remove({ id, deletedAt, deletedBy });
  });
};

export { deleteCampaignParticipation };
