import chunk from 'lodash/chunk.js';

import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';

const CHUNK_SIZE = 1000;

const getResultLevelsPerTubesAndCompetences = async ({
  campaignId,
  locale,
  campaignParticipationRepository,
  learningContentRepository,
  knowledgeStateSnapshotRepository,
}) => {
  const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignId);
  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);

  const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
    id: campaignId,
    learningContent,
  });

  const campaignParticipationIdsChunks = chunk(campaignParticipationIds, CHUNK_SIZE);
  for (const chunk of campaignParticipationIdsChunks) {
    const knowledgeStatesByParticipation = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds(chunk);
    campaignResult.addKnowledgeStates(knowledgeStatesByParticipation);
  }

  return campaignResult;
};

export { getResultLevelsPerTubesAndCompetences };
