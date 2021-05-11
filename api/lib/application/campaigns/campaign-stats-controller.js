const usecases = require('../../domain/usecases');
const participationsByStageSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer');

module.exports = {
  async getParticipationsByStage(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const participationsByStage = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

    return participationsByStageSerializer.serialize({
      campaignId,
      data: participationsByStage,
    });
  },
};

