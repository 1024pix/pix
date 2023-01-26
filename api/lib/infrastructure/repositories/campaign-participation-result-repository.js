const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const campaignParticipationRepository = require('./campaign-participation-repository');
const campaignRepository = require('./campaign-repository');
const competenceRepository = require('./competence-repository');
const areaRepository = require('./area-repository');
const assessmentRepository = require('./assessment-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');

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

module.exports = campaignParticipationResultRepository;
