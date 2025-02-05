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

  const questResults = [];
  for (const quest of quests) {
    const isEligibleForQuest = eligibilities.some((eligibility) =>
      quest.isGrantedWithParticipationId({ eligibility, campaignParticipationId }),
    );

    if (!isEligibleForQuest) {
      continue;
    }

    const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
    questResults.push(questResult);
  }

  return questResults;
};
