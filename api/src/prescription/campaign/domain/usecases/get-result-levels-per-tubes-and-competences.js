import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';

const getResultLevelsPerTubesAndCompetences = async ({
  campaignId,
  locale,
  campaignParticipationRepository,
  learningContentRepository,
  knowledgeElementSnapshotRepository,
}) => {
  const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignId);

  const knowledgeElementsByParticipation =
    await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(campaignParticipationIds);

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);

  return new CampaignResultLevelsPerTubesAndCompetences({
    campaignId,
    learningContent,
    knowledgeElementsByParticipation,
  });
};

export { getResultLevelsPerTubesAndCompetences };
