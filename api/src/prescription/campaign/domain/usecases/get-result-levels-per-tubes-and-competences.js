import chunk from 'lodash/chunk.js';

import * as injectedCampaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedKnowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';

const CHUNK_SIZE = 1000;

const getResultLevelsPerTubesAndCompetences = async ({
  campaignId,
  locale,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  learningContentRepository = injectedLearningContentRepository,
  knowledgeElementSnapshotRepository = injectedKnowledgeElementSnapshotRepository,
} = {}) => {
  const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignId);
  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);

  const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
    campaignId,
    learningContent,
  });

  const campaignParticipationIdsChunks = chunk(campaignParticipationIds, CHUNK_SIZE);
  for (const chunk of campaignParticipationIdsChunks) {
    const knowledgeElementsByParticipation =
      await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(chunk);
    campaignResult.addKnowledgeElementSnapshots(knowledgeElementsByParticipation);
  }

  return campaignResult;
};

export { getResultLevelsPerTubesAndCompetences };
