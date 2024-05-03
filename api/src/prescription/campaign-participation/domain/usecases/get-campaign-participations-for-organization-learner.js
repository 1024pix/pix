const getCampaignParticipationsForOrganizationLearner = async function ({
  campaignId,
  organizationLearnerId,
  campaignParticipationRepository,
}) {
  const campaignParticipations = await campaignParticipationRepository.getCampaignParticipationsForOrganizationLearner({
    campaignId,
    organizationLearnerId,
  });
  return campaignParticipations;
};

export { getCampaignParticipationsForOrganizationLearner };
