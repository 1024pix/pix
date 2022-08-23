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
  }
};
