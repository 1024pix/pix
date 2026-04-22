import { DataForQuest } from '../models/DataForQuest.js';

export const getQuestResultsForCampaignParticipation = async ({
  userId,
  campaignParticipationId,
  questRepository,
  eligibilityRepository,
  rewardRepository,
  logger,
}) => {
  try {
    const quests = await questRepository.findAllWithReward();

    if (quests.length === 0) {
      return [];
    }

    const questResults = [];
    for (const quest of quests) {
      const eligibilities = await eligibilityRepository.find({ userId, quest });
      const dataForQuest = eligibilities
        .map((eligibility) => new DataForQuest({ eligibility }))
        .find((dataForQuest) => dataForQuest.hasCampaignParticipation(campaignParticipationId));

      if (!dataForQuest) continue;
      if (!quest.isCampaignParticipationContributingToQuest({ data: dataForQuest, campaignParticipationId })) continue;
      if (!quest.isEligible(dataForQuest)) continue;

      const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
      questResults.push(questResult);
    }

    return questResults;
  } catch (error) {
    logger.error({ event: 'quest-result', err: error }, 'Error on quests');
    return [];
  }
};
