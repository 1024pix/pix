import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases as devcompUsecases } from '../../domain/usecases/index.js';
import * as trainingSerializer from '../../infrastructure/serializers/jsonapi/training-serializer.js';

const findPaginatedUserRecommendedTrainings = async function (request, h, dependencies = { devcompUsecases }) {
  const locale = getChallengeLocale(request);
  const { page } = request.query;
  const { userRecommendedTrainings, meta } = await dependencies.devcompUsecases.findPaginatedUserRecommendedTrainings({
    userId: request.auth.credentials.userId,
    locale,
    page,
  });

  return trainingSerializer.serialize(userRecommendedTrainings, meta);
};

export const userTrainingsController = {
  findPaginatedUserRecommendedTrainings,
};
