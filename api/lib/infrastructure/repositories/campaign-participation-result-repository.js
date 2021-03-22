const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const campaignParticipationRepository = require('./campaign-participation-repository');
const targetProfileRepository = require('./target-profile-repository');
const competenceRepository = require('./competence-repository');
const assessmentRepository = require('./assessment-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');

const campaignParticipationResultRepository = {
  async getByParticipationId(campaignParticipationId, campaignBadges, acquiredBadgeIds, locale) {
    const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

    const [targetProfile, competences, assessment] = await Promise.all([
      targetProfileRepository.getByCampaignId(campaignParticipation.campaignId),
      competenceRepository.list({ locale }),
      assessmentRepository.get(campaignParticipation.assessmentId),
    ]);

    const snapshots = await knowledgeElementRepository.findSnapshotForUsers({ [campaignParticipation.userId]: campaignParticipation.sharedAt });
    return CampaignParticipationResult.buildFrom({
      campaignParticipationId,
      assessment,
      competences,
      targetProfile,
      knowledgeElements: snapshots[campaignParticipation.userId],
      campaignBadges,
      acquiredBadgeIds,
    });
  },
};

module.exports = campaignParticipationResultRepository;
