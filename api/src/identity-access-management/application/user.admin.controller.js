import * as userLoginSerializer from '../../../lib/infrastructure/serializers/jsonapi/user-login-serializer.js';
import { usecases } from '../domain/usecases/index.js';

/**
 * @param request
 * @param h
 * @param {object} dependencies
 * @param {UserLoginSerializer} dependencies.userLoginSerializer
 * @return {Promise<*>}
 */
const unblockUserAccount = async function (request, h, dependencies = { userLoginSerializer }) {
  const userId = request.params.id;
  const userLogin = await usecases.unblockUserAccount({ userId });
  return h.response(dependencies.userLoginSerializer.serialize(userLogin)).code(200);
};

/**
 * @typedef {object} UserAdminController
 * @property {function} unblockUserAccount
 */
const userAdminController = { unblockUserAccount };

export { userAdminController };
