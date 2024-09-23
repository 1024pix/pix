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

  const rewards = await rewardRepository.getByUserId({ userId });
  const rewardIds = rewards.map((reward) => reward.rewardId);

  for (const quest of quests) {
    const isEligibleForQuest = eligibilities.some((eligibility) => quest.isEligible(eligibility));

    if (!isEligibleForQuest) {
      continue;
    }

    if (rewardIds.includes(quest.rewardId)) {
      continue;
    }

    const success = await successRepository.find({ userId, skillIds: quest.successRequirements[0].data.ids });
    const userHasSucceedQuest = quest.isSuccessful(success);

    if (userHasSucceedQuest) {
      await rewardRepository.reward({ userId, rewardId: quest.rewardId });
    }
  }
};
