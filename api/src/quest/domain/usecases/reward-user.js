export const rewardUser = async ({
  userId,
  questRepository,
  eligibilityRepository,
  successRepository,
  rewardRepository,
}) => {
  const quests = await questRepository.findAll();

  if (quests.length === 0) {
    return;
  }

  const eligibilities = await eligibilityRepository.find({ userId });

  for (const quest of quests) {
    const isEligibleForQuest = eligibilities.some((eligibility) => quest.isEligible(eligibility));

    if (!isEligibleForQuest) {
      continue;
    }

    const success = await successRepository.find({ userId, skillIds: quest.successRequirements[0].data.ids });
    const userHasSucceedQuest = quest.isSuccessful(success);

    if (userHasSucceedQuest) {
      await rewardRepository.reward({ userId, rewardId: quest.rewardId });
    }
  }
};
