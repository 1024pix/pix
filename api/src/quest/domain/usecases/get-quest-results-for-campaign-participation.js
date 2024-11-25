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

  /*
  This effectively overrides the existing campaignParticipations property with a new getter that always returns the updated targetProfileIds array based on the provided campaignParticipationId.
  We can't just reassign the getter with the new value, because the getter will still be called and the new value would be ignored
  */
  Object.defineProperty(eligibility, 'campaignParticipations', {
    get: () => ({ targetProfileIds: [eligibility.getTargetProfileForCampaignParticipation(campaignParticipationId)] }),
  });

  const questResults = [];
  for (const quest of quests) {
    const isEligibleForQuest = quest.isEligible(eligibility);

    if (!isEligibleForQuest) continue;

    const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
    questResults.push(questResult);
  }

  return questResults;
};
