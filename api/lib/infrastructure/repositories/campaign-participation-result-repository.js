const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult.js');
const campaignParticipationRepository = require('./campaign-participation-repository.js');
const campaignRepository = require('./campaign-repository.js');
const competenceRepository = require('./competence-repository.js');
const areaRepository = require('./area-repository.js');
const assessmentRepository = require('./assessment-repository.js');
const knowledgeElementRepository = require('./knowledge-element-repository.js');

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
