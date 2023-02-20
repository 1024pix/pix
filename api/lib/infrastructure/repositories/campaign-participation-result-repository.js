import CampaignParticipationResult from '../../domain/models/CampaignParticipationResult';
import campaignParticipationRepository from './campaign-participation-repository';
import campaignRepository from './campaign-repository';
import competenceRepository from './competence-repository';
import areaRepository from './area-repository';
import assessmentRepository from './assessment-repository';
import knowledgeElementRepository from './knowledge-element-repository';

const campaignParticipationResultRepository = {
  async getByParticipationId(campaignParticipationId) {
    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

    const [stages, skillIds, competences, assessment, snapshots] = await Promise.all([
      campaignRepository.findStages({ campaignId: campaignParticipation.campaignId }),
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
      stages,
      skillIds,
      knowledgeElements: snapshots[campaignParticipation.userId],
      allAreas,
    });
  },
};

export default campaignParticipationResultRepository;
