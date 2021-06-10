const usecases = require('../../domain/usecases');
const participationsByStageSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer');
const participationsByStatusSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-counts-by-status-serializer');

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

  async getParticipationsByStatus(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const participantsCounts = await usecases.getCampaignParticipationsCountsByStatus({ userId, campaignId });

    return participationsByStatusSerializer.serialize({
      campaignId,
      ...participantsCounts,
    });
  },
};

