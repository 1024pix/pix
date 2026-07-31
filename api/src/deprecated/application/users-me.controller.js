import { usecases } from '../domain/usecases/index.js';
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

export const usersMeController = { getCurrentUser };
