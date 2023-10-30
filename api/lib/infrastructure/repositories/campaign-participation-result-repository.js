import { CampaignParticipationResult } from '../../domain/models/CampaignParticipationResult.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';
import * as campaignRepository from './campaign-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as areaRepository from './area-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';

const campaignParticipationResultRepository = {
  async getByParticipationId(campaignParticipationId) {
    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

    const [skillIds, competences, assessment, snapshots] = await Promise.all([
      campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId }),
      competenceRepository.list(),
      assessmentRepository.get(campaignParticipation.lastAssessment.id),
      knowledgeElementRepository.findSnapshotForUsers({
        [campaignParticipation.userId]: campaignParticipation.sharedAt,
      }),
    ]);
    const allAreas = await areaRepository.list();

    return CampaignParticipationResult.buildFrom({
      campaignParticipationId,
      assessment,
      competences,
      skillIds,
      knowledgeElements: snapshots[campaignParticipation.userId],
      allAreas,
    });
  },
};

export { campaignParticipationResultRepository };
