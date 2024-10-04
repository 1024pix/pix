import { usecases } from '../../domain/usecases/index.js';
import * as userDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-details-for-admin.serializer.js';
import * as userForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-for-admin.serializer.js';
import * as userLoginSerializer from '../../infrastructure/serializers/jsonapi/user-login-serializer.js';

/**
 *
 * @param request
 * @param h
 * @param {object} dependencies
 * @param {UserForAdminSerializer} dependencies.userForAdminSerializer
 * @returns {Promise<*>}
 */
const findPaginatedFilteredUsers = async function (request, h, dependencies = { userForAdminSerializer }) {
  const { filter, page } = request.query;

  const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({ filter, page });
  return dependencies.userForAdminSerializer.serialize(users, pagination);
};

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
 * @param request
 * @param h
 * @param {object} dependencies
 * @param {UserDetailsForAdminSerializer} dependencies.userDetailsForAdminSerializer
 * @return {Promise<*>}
 */
const updateUserDetailsByAdmin = async function (request, h, dependencies = { userDetailsForAdminSerializer }) {
  const userId = request.params.id;
  const userDetailsToUpdate = dependencies.userDetailsForAdminSerializer.deserialize(request.payload);

  const updatedUser = await usecases.updateUserDetailsByAdmin({ userId, userDetailsToUpdate });

  return dependencies.userDetailsForAdminSerializer.serializeForUpdate(updatedUser);
};

/**
 * @typedef {object} UserAdminController
 * @property {function} findPaginatedFilteredUsers
 * @property {function} unblockUserAccount
 * @property {function} updateUserDetailsByAdmin
 */
const userAdminController = { findPaginatedFilteredUsers, unblockUserAccount, updateUserDetailsByAdmin };

export { userAdminController };
