import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases as devcompUsecases } from '../../domain/usecases/index.js';
import { trainingSerializer } from '../../infrastructure/serializers/jsonapi/training-serializer.js';

const findTrainings = async function (request, h, dependencies = { trainingSerializer }) {
  const { userId } = request.auth.credentials;
  const { id: campaignParticipationId } = request.params;
  const locale = getChallengeLocale(request);

  const trainings = await devcompUsecases.findCampaignParticipationTrainings({
    userId,
    campaignParticipationId,
    locale,
  });
  return dependencies.trainingSerializer.serialize(trainings);
};

const saveUserRelevanceFeedbackOnRecommendedTraining = async function (request, h) {
  const { userId } = request.auth.credentials;
  const { campaignParticipationId, trainingId } = request.params;
  const isRelevant = request.payload.data.attributes['is-relevant'];

  await devcompUsecases.saveUserRelevanceFeedbackOnRecommendedTraining({
    userId,
    trainingId,
    campaignParticipationId,
    isRelevant,
  });

  return h.response().code(204);
};

const campaignParticipationController = {
  findTrainings,
  saveUserRelevanceFeedbackOnRecommendedTraining,
};

export { campaignParticipationController };
