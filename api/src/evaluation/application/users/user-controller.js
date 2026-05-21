import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';
import { userSerializer } from '../../infrastructure/serializers/jsonapi/user-serializer.js';

const rememberUserHasSeenNewDashboardInfo = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
  return userSerializer.serialize(updatedUser);
};

const rememberUserHasSeenAssessmentInstructions = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
  return userSerializer.serialize(updatedUser);
};

const userController = {
  rememberUserHasSeenNewDashboardInfo,
  rememberUserHasSeenAssessmentInstructions,
};

export { userController };
