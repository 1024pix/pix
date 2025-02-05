import * as campaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';

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

  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  const eligibilities = await eligibilityRepository.find({ userId });
  const eligibility = eligibilities.find(
    (eligibility) => eligibility.organizationLearner.id === campaignParticipation.organizationLearnerId,
  );

  const questsRelatedToCampaignParticipation = quests.filter((q) =>
    q.isGrantedWithParticipationId({ eligibility, campaignParticipationId }),
  );
  console.log({ questsRelatedToCampaignParticipation });

  const questResults = [];
  for (const quest of questsRelatedToCampaignParticipation) {
    const questResult = await rewardRepository.getByQuestAndUserId({ userId, quest });
    questResults.push(questResult);
  }

  return questResults;
};
