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

module.exports = campaignParticipationResultRepository;
