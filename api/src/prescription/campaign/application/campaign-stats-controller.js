import { usecases } from '../domain/usecases/index.js';
import { badgeAcquisitionsStatisticsSerializer } from '../infrastructure/serializers/jsonapi/badge-acquisitions-statistics-serializer.js';
import { campaignParticipationsCountByStageSerializer } from '../infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer.js';
import { campaignParticipationsCountsByDaySerializer } from '../infrastructure/serializers/jsonapi/campaign-participations-counts-by-day-serializer.js';
import { campaignParticipationsCountsByStatusSerializer } from '../infrastructure/serializers/jsonapi/campaign-participations-counts-by-status-serializer.js';
import { participationsCountByMasteryRateSerializer } from '../infrastructure/serializers/jsonapi/participations-count-by-mastery-rate.js';

const getParticipationsByStage = async function (request) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const participationsByStage = await usecases.getCampaignParticipationsCountByStage({ userId, campaignId });

  return campaignParticipationsCountByStageSerializer.serialize({
    campaignId,
    data: participationsByStage,
  });
};

const getParticipationsByStatus = async function (request) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const participantsCounts = await usecases.getCampaignParticipationsCountsByStatus({ userId, campaignId });

  return campaignParticipationsCountsByStatusSerializer.serialize({
    campaignId,
    ...participantsCounts,
  });
};
const getParticipationsByDay = async function (request) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const participantsCounts = await usecases.getCampaignParticipationsActivityByDay({ userId, campaignId });

  return campaignParticipationsCountsByDaySerializer.serialize({
    campaignId,
    ...participantsCounts,
  });
};

const getBadgeAcquisitions = async (request) => {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const badgesAcquisitionStatistics = await usecases.getBadgeAcquisitionsStatistics({ userId, campaignId });

  return badgeAcquisitionsStatisticsSerializer.serialize({
    campaignId,
    data: badgesAcquisitionStatistics,
  });
};

const getParticipationsCountByMasteryRate = async function (request) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;

  const resultDistribution = await usecases.getParticipationsCountByMasteryRate({ userId, campaignId });

  return participationsCountByMasteryRateSerializer.serialize({
    campaignId,
    resultDistribution,
  });
};

const campaignStatsController = {
  getParticipationsByStage,
  getParticipationsByStatus,
  getParticipationsByDay,
  getParticipationsCountByMasteryRate,
  getBadgeAcquisitions,
};

export { campaignStatsController };
