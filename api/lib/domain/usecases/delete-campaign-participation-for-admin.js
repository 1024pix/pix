const bluebird = require('bluebird');

module.exports = async function deleteCampaignParticipationForAdmin({
  userId,
  campaignParticipationId,
  domainTransaction,
  campaignRepository,
  campaignParticipationRepository,
}) {
  const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignFromCampaignParticipationId({
      campaignId,
      campaignParticipationId,
      domainTransaction,
    });

  await bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {
    campaignParticipation.delete(userId);
    const { id, deletedAt, deletedBy } = campaignParticipation;
    await campaignParticipationRepository.delete({ id, deletedAt, deletedBy, domainTransaction });
  });

  return campaignParticipations;
};
