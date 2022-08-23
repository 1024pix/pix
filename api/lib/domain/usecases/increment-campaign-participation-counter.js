module.exports = async function incrementCampaignParticipationCounter({
  campaignParticipation,
  domainTransaction,
  campaignRepository,
  campaignParticipationRepository,
}) {
  const campaignParticipations =
    await campaignParticipationRepository.getAllCampaignParticipationsInCampaignForOrganizationLearnerId({
      campaignId: campaignParticipation.campaignId,
      organizationLearnerId: campaignParticipation.organizationLearnerId,
      domainTransaction,
    });

  if (campaignParticipations.length == 1) {
    return campaignRepository.incrementParticipationsCount(campaignParticipation.campaignId, domainTransaction);
  } else {
    const previousCampaignParticipation = campaignParticipations.at(-2);
    const hasSharedLastParticipation = previousCampaignParticipation.sharedAt;
    if (hasSharedLastParticipation) {
      return campaignRepository.decrementSharedParticipationsCount(campaignParticipation.campaignId, domainTransaction);
    }
  }
};
