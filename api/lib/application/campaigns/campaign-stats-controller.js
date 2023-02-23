const usecases = require('../../domain/usecases/index.js');
const participationsByStageSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer.js');
const participationsByStatusSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-counts-by-status-serializer.js');
const participationsByDaySerializer = require('../../infrastructure/serializers/jsonapi/campaign-participations-counts-by-day-serializer.js');
const participationsCountByMasteryRateSerializer = require('../../infrastructure/serializers/jsonapi/participations-count-by-mastery-rate.js');

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

  async getParticipationsByDay(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const participantsCounts = await usecases.getCampaignParticipationsActivityByDay({ userId, campaignId });

    return participationsByDaySerializer.serialize({
      campaignId,
      ...participantsCounts,
    });
  },

  async getParticipationsCountByMasteryRate(request) {
    const { userId } = request.auth.credentials;
    const campaignId = request.params.id;

    const resultDistribution = await usecases.getParticipationsCountByMasteryRate({ userId, campaignId });

    return participationsCountByMasteryRateSerializer.serialize({
      campaignId,
      resultDistribution,
    });
  },
};
