import * as userSerializer from '../../../shared/infrastructure/serializers/jsonapi/user-serializer.js';
import { evaluationUsecases as usecases } from '../../domain/usecases/index.js';

const rememberUserHasSeenLevelSevenInfo = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenLevelSevenInfo({ userId: authenticatedUserId });
  return dependencies.userSerializer.serialize(updatedUser);
};

const rememberUserHasSeenNewDashboardInfo = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
  return dependencies.userSerializer.serialize(updatedUser);
};

const userController = { rememberUserHasSeenLevelSevenInfo, rememberUserHasSeenNewDashboardInfo };

export { userController };
