import { CampaignParticipationResult } from '../../../../shared/domain/models/CampaignParticipationResult.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';

const campaignParticipationResultRepository = {
  async getByParticipationId(campaignParticipationId) {
    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

    const [skillIds, competences, assessment, knowledgeElements] = await Promise.all([
      campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId }),
      competenceRepository.list(),
      assessmentRepository.get(campaignParticipation.lastAssessment.id),
      getKnowledgeElements(campaignParticipation),
    ]);
    const allAreas = await areaRepository.list();

    return CampaignParticipationResult.buildFrom({
      campaignParticipationId,
      assessment,
      competences,
      skillIds,
      knowledgeElements,
      allAreas,
    });
  },
};

async function getKnowledgeElements(campaignParticipation) {
  const snapshot = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipation.id]);
  if (snapshot[campaignParticipation.id]) {
    return snapshot[campaignParticipation.id];
  }

  return knowledgeElementRepository.findUniqByUserId({
    userId: campaignParticipation.userId,
  });
}

export { campaignParticipationResultRepository };
