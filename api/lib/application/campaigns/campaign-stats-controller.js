import usecases from '../../domain/usecases';
import participationsByStageSerializer from '../../infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer';
import participationsByStatusSerializer from '../../infrastructure/serializers/jsonapi/campaign-participations-counts-by-status-serializer';
import participationsByDaySerializer from '../../infrastructure/serializers/jsonapi/campaign-participations-counts-by-day-serializer';
import participationsCountByMasteryRateSerializer from '../../infrastructure/serializers/jsonapi/participations-count-by-mastery-rate';

export default {
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
