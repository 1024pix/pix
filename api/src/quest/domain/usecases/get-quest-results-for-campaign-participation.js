export const getQuestResultsForCampaignParticipation = async ({
  userId,
  campaignParticipationId,
  questRepository,
  eligibilityRepository,
  rewardRepository,
}) => {
  const quests = await questRepository.findAll();

  if (quests.length === 0) {
    return false;
  }

  const eligibilities = await eligibilityRepository.find({ userId });
  const eligibility = eligibilities.find((e) => e.hasCampaignParticipation(campaignParticipationId));

  if (!eligibility) return [];

  eligibility.campaignParticipations.targetProfileIds = [
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
