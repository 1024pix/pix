import { logger as injectedLogger } from '../../../shared/infrastructure/utils/logger.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import { DataForQuest } from '../models/DataForQuest.js';

export const rewardUser = async ({
  userId,
  questRepository = injectedRepositories.questRepository,
  eligibilityRepository = injectedRepositories.eligibilityRepository,
  successRepository = injectedRepositories.successRepository,
  rewardRepository = injectedRepositories.rewardRepository,
  logger = injectedLogger,
} = {}) => {
  try {
    if (!userId) {
      return;
    }
    const quests = await questRepository.findAllWithReward();

    if (quests.length === 0) {
      return;
    }

    const eligibilities = await eligibilityRepository.find({ userId });
    const rewards = await rewardRepository.getByUserId({ userId });

    const rewardIds = rewards.map((reward) => reward.rewardId);

    for (const quest of quests) {
      if (rewardIds.includes(quest.rewardId)) {
        continue;
      }

      const dataForQuests = eligibilities
        .map((eligibility) => new DataForQuest({ eligibility }))
        .filter((dataForQuest) => quest.isEligible(dataForQuest));

      if (dataForQuests.length === 0) {
        continue;
      }

      for (const dataForQuest of dataForQuests) {
        const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);
        const targetProfileIds =
          quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);
        const success = await successRepository.find({ userId, campaignParticipationIds, targetProfileIds });
        dataForQuest.success = success;
        const userHasSucceedQuest = quest.isSuccessful(dataForQuest);

        if (userHasSucceedQuest) {
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
