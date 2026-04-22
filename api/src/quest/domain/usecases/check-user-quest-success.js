import { NotFoundError } from '../../../shared/domain/errors.js';
import { DataForQuest } from '../models/DataForQuest.js';

export const checkUserQuest = async ({
  userId,
  questRepository,
  eligibilityRepository,
  successRepository,
  questId,
}) => {
  if (!userId) {
    return;
  }

  const quest = await questRepository.findById({ questId });

  if (!quest) {
    throw new NotFoundError(`No quest found for questId ${questId}`);
  }

  const eligibilities = await eligibilityRepository.find({ userId, quest });

  const dataForQuest = eligibilities
    .map((eligibility) => new DataForQuest({ eligibility }))
    .find((dataForQuest) => quest.isEligible(dataForQuest));

  if (!dataForQuest && quest.eligibilityRequirements.length !== 0) {
    return false;
  }

  if (!dataForQuest && quest.eligibilityRequirements.length === 0 && quest.successRequirements.length === 0) {
    return true;
  }

  const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);
  const targetProfileIds = quest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);
  const success = await successRepository.find({ userId, campaignParticipationIds, targetProfileIds, quest });
  dataForQuest.success = success;

  return quest.isSuccessful(dataForQuest);
};
