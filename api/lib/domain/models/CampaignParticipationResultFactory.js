const CampaignParticipationResult = require('./CampaignParticipationResult');

class CampaignParticipationResultFactory {
  constructor(
    campaignParticipationRepository,
    targetProfileRepository,
    competenceRepository,
    assessmentRepository,
    knowledgeElementRepository
  ) {
    this.campaignParticipationRepository = campaignParticipationRepository;
    this.targetProfileRepository = targetProfileRepository;
    this.competenceRepository = competenceRepository;
    this.assessmentRepository = assessmentRepository;
    this.knowledgeElementRepository = knowledgeElementRepository;
  }

  async create(campaignParticipationId) {
    const campaignParticipation = await this.campaignParticipationRepository.get(campaignParticipationId);

    const [targetProfile, competences, assessment, knowledgeElements] = await Promise.all([
      this.targetProfileRepository.getByCampaignId(campaignParticipation.campaignId),
      this.competenceRepository.list(),
      this.assessmentRepository.get(campaignParticipation.assessmentId),
      this.knowledgeElementRepository.findUniqByUserId({
        userId: campaignParticipation.userId,
        limitDate: campaignParticipation.sharedAt
      }),
    ]);

    const campaignParticipationResult = CampaignParticipationResult.buildFrom({
      campaignParticipationId,
      assessment,
      competences,
      targetProfile,
      knowledgeElements,
      badge: null
    });
    return campaignParticipationResult;
  }
}
module.exports = CampaignParticipationResultFactory;
