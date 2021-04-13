const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const campaignParticipationRepository = require('./campaign-participation-repository');
const targetProfileRepository = require('./target-profile-repository');
const competenceRepository = require('./competence-repository');
const assessmentRepository = require('./assessment-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');

const DomainTransaction = require('../DomainTransaction');

const campaignParticipationResultRepository = {

  async getByParticipationId({
    campaignParticipationId,
    campaignBadges,
    acquiredBadgeIds,
    locale,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const campaignParticipation = await campaignParticipationRepository.get({ id: campaignParticipationId, domainTransaction });

    const [targetProfile, competences, assessment] = await Promise.all([
      targetProfileRepository.getByCampaignId(campaignParticipation.campaignId, domainTransaction),
      competenceRepository.list({ locale }),
      assessmentRepository.get(campaignParticipation.assessmentId, domainTransaction),
    ]);

    const snapshots = await knowledgeElementRepository.findSnapshotForUsers({ [campaignParticipation.userId]: campaignParticipation.sharedAt }, domainTransaction);

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
