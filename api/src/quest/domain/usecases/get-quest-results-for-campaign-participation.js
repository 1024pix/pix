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
  const eligibility = eligibilities.find((eligibility) =>
    eligibility.hasCampaignParticipation(campaignParticipationId),
  );
  if (!eligibility) {
    return [];
  }

  const questsRelatedToCampaignParticipation = quests.filter((q) =>
    q.isCampaignParticipationContributingToQuest({ eligibility, campaignParticipationId }),
  );

  const questResults = [];
  for (const quest of questsRelatedToCampaignParticipation) {
    const isEligible = quest.isEligible(eligibility);
    if (!isEligible) continue;
    const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
    questResults.push(questResult);
  }

  return questResults;
};
