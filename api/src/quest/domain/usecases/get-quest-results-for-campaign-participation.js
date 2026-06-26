import { DataForQuest } from '../models/quests/aggregates/DataForQuest.js';

export const getQuestResultsForCampaignParticipation = async ({
  userId,
  campaignParticipationId,
  questRepository,
  eligibilityRepository,
  profileRewardRepository,
  logger,
}) => {
  try {
    const quests = await questRepository.findAllWithReward({ includeCombinedCourses: false });

    if (quests.length === 0) {
      return [];
    }

    const eligibilities = await eligibilityRepository.find({ userId });
    const dataForQuest = eligibilities
      .map((eligibility) => new DataForQuest({ eligibility }))
      .find((dataForQuest) => dataForQuest.hasCampaignParticipation(campaignParticipationId));

    if (!dataForQuest) {
      return [];
    }

    const questsRelatedToCampaignParticipation = quests.filter((q) =>
      q.isCampaignParticipationContributingToQuest({ data: dataForQuest, campaignParticipationId }),
    );

    const questResults = [];
    for (const quest of questsRelatedToCampaignParticipation) {
      const isEligible = quest.isEligible(dataForQuest);
      if (!isEligible) continue;
      const questResult = await profileRewardRepository.getByQuestAndUserId({ userId, quest });
      questResults.push(questResult);
    }

    return questResults;
  } catch (error) {
    logger.error({ event: 'quest-result', err: error }, 'Error on quests');
    return [];
  }
};
