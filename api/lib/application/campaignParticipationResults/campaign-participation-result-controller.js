const usecases = require('../../domain/usecases');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-result-serializer');
const CampaignParticipantionResultFactory = require('../../domain/models/CampaignParticipationResultFactory');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');

module.exports = {
  async get(request) {
    const campaignParticipationId = parseInt(request.params.id);
    const userId = request.auth.credentials.userId;

    // TODO : move instanciation of factory elsewhere (inject it ?)
    const campaignParticipationResultFactory = new CampaignParticipantionResultFactory(
      campaignParticipationRepository,
      targetProfileRepository,
      competenceRepository,
      assessmentRepository,
      knowledgeElementRepository
    );

    const report = await usecases.getCampaignParticipationResult(
      {
        campaignParticipationId,
        userId,
        campaignParticipationResultFactory
      }
    );

    return serializer.serialize(report);
  },
};
