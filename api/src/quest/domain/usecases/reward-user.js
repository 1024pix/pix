import { DataForQuest } from '../models/DataForQuest.js';

export const rewardUser = async ({
  userId,
  questRepository,
  eligibilityRepository,
  successRepository,
  rewardRepository,
  logger,
}) => {
  try {
    if (!userId) {
      return;
    }
    const quests = await questRepository.findAllWithReward();

    if (quests.length === 0) {
      return;
    }

    logger.debug(`Found ${quests.length} quests with reward for user ${userId}`);

    const rewards = await rewardRepository.getByUserId({ userId });

    const rewardIds = rewards.map((reward) => reward.rewardId);

    for (const quest of quests) {
      logger.debug(`Parsing quest ${quest.id} with reward ${quest.rewardId} for user ${userId}`);

      if (rewardIds.includes(quest.rewardId)) {
        continue;
      }

      const eligibilities = await eligibilityRepository.find({ userId, quest });
      const dataForQuests = eligibilities
        .map((eligibility) => new DataForQuest({ eligibility }))
        .filter((dataForQuest) => quest.isEligible(dataForQuest));

      if (dataForQuests.length === 0) {
        continue;
      }

      for (const dataForQuest of dataForQuests) {
        logger.debug(`Eligibilities found on quest ${quest.id} for user ${userId}`);
        logger.debug({ dataForQuest }, `Eligibilities for quest ${quest.id}`);

        const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);
        const targetProfileIds =
          quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);

        const success = await successRepository.find({ userId, campaignParticipationIds, targetProfileIds, quest });
        logger.debug({ success }, `Success for quest ${quest.id}`);
        dataForQuest.success = success;

        const userHasSucceedQuest = quest.isSuccessful(dataForQuest);

        if (userHasSucceedQuest) {
          logger.debug(`Success found on quest ${quest.id} for user ${userId}. Pushing reward ${quest.rewardId}`);

          await rewardRepository.reward({ userId, rewardId: quest.rewardId });
          rewardIds.push(quest.rewardId);
          break;
        }
      }
    }
  } catch (error) {
    logger.error({ event: 'quest-reward', err: error }, 'Error on quests');
  }
};
