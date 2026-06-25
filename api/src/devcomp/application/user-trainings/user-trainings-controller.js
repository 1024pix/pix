import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases as devcompUsecases } from '../../domain/usecases/index.js';
import { trainingSerializer } from '../../infrastructure/serializers/jsonapi/training-serializer.js';

const findPaginatedUserRecommendedTrainings = async function (
  request,
  h,
  dependencies = {
    trainingSerializer,
    devcompUsecases,
  },
) {
  const locale = getChallengeLocale(request);
  const { page } = request.query;
  const { userRecommendedTrainings, meta } = await dependencies.devcompUsecases.findPaginatedUserRecommendedTrainings({
    userId: request.auth.credentials.userId,
    locale,
    page,
  });

  return dependencies.trainingSerializer.serialize(userRecommendedTrainings, meta);
};

const userTrainingsController = {
  findPaginatedUserRecommendedTrainings,
};

export { userTrainingsController };
