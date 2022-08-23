module.exports = async function updateCampaignCountsAfterDeleteParticipation({
  campaignId,
  deletedCampaignParticipations,
  domainTransaction,
  campaignRepository,
}) {
  await campaignRepository.decrementParticipationsCount(campaignId, domainTransaction);

  const hasSharedParticipation = deletedCampaignParticipations.some(
    (campaignParticipation) => campaignParticipation.sharedAt && !campaignParticipation.isImproved
  );
  if (hasSharedParticipation) {
    await campaignRepository.decrementSharedParticipationsCount(campaignId, domainTransaction);
  }
};
