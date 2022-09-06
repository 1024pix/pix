module.exports = async function incrementSharedCampaignParticipationsCount({
  campaignParticipationId,
  domainTransaction,
  campaignRepository,
}) {
  const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(
    campaignParticipationId,
    domainTransaction
  );
  return campaignRepository.incrementSharedParticipationsCount(campaignId, domainTransaction);
};
