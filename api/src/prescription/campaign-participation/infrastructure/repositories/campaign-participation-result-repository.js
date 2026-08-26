import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeStateRepository from '../../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeStateSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';
import { CampaignParticipationResult } from '../../domain/models/CampaignParticipationResult.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';

const campaignParticipationResultRepository = {
  async getByParticipationId(campaignParticipationId) {
    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

    const skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });
    const competences = await competenceRepository.list();
    const assessment = await assessmentRepository.get(campaignParticipation.lastAssessment.id);
    const knowledgeState = await getKnowledgeState(campaignParticipation);

    const allAreas = await areaRepository.list();

    return CampaignParticipationResult.buildFrom({
      campaignParticipationId,
      assessment,
      competences,
      skillIds,
      knowledgeState,
      allAreas,
    });
  },
};

async function getKnowledgeState(campaignParticipation) {
  const snapshot = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([campaignParticipation.id]);
  if (snapshot[campaignParticipation.id]) {
    return snapshot[campaignParticipation.id];
  }

  return knowledgeStateRepository.findByUserId({
    userId: campaignParticipation.userId,
  });
}

export { campaignParticipationResultRepository };
