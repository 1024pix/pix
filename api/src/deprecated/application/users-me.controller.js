import { usecases } from '../domain/usecases/index.js';
import { userAccountInfoSerializer } from '../infrastructure/serializers/jsonapi/user-account-info.serializer.js';
import { userWithActivitySerializer } from '../infrastructure/serializers/jsonapi/user-with-activity.serializer.js';

/**
 * @param request
 * @param h
 * @param {object} dependencies
 * @param {UserWithActivitySerializer} dependencies.userWithActivitySerializer
 * @return {Promise<*>}
 */
const getCurrentUser = async function (request, h, dependencies = { userWithActivitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const result = await usecases.getCurrentUser({ authenticatedUserId });

  return dependencies.userWithActivitySerializer.serialize(result);
};

/**
 * @param request
 * @param h
 * @param {object} dependencies
 * @param {UserAccountInfoSerializer} dependencies.userAccountInfoSerializer
 * @return {Promise<*>}
 */
const getCurrentUserAccountInfo = async function (request, h, dependencies = { userAccountInfoSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const userAccountInfo = await usecases.getUserAccountInfo({ userId: authenticatedUserId });

  return dependencies.userAccountInfoSerializer.serialize(userAccountInfo);
};

export const usersMeController = { getCurrentUser, getCurrentUserAccountInfo };
