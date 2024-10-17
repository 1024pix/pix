export const getQuestResultsForCampaignParticipation = async ({
  userId,
  campaignParticipationId,
  questRepository,
  eligibilityRepository,
  rewardRepository,
}) => {
  const quests = await questRepository.findAll();

  if (quests.length === 0) {
    return [];
  }

  const eligibilities = await eligibilityRepository.find({ userId });
  const eligibility = eligibilities.find((e) => e.hasCampaignParticipation(campaignParticipationId));

  if (!eligibility) return [];

  eligibility.campaignParticipations.targetProfileIds = [
    // getTargetProfileForCampaignParticipation returns null but this usecase is used for campaign participation result page for now, so the campaign participation ID always exists
    // if this usecase is to be used in another context, the edge case must be handled
    eligibility.getTargetProfileForCampaignParticipation(campaignParticipationId),
  ];

  const questResults = [];
  for (const quest of quests) {
    const isEligibleForQuest = quest.isEligible(eligibility);

    if (!isEligibleForQuest) continue;

    const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
    questResults.push(questResult);
  }

  return questResults;
};
