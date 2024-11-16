import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';
import * as userAnonymizedDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-anonymized-details-for-admin.serializer.js';
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
  const updatedByAdminId = request.auth.credentials.userId;
  const userId = request.params.id;
  const userDetailsToUpdate = dependencies.userDetailsForAdminSerializer.deserialize(request.payload);

  const updatedUser = await usecases.updateUserDetailsByAdmin({ userId, userDetailsToUpdate, updatedByAdminId });

  return dependencies.userDetailsForAdminSerializer.serializeForUpdate(updatedUser);
};

/**
 *
 * @param request
 * @param h
 * @param dependencies
 * @param {UserDetailsForAdminSerializer} dependencies.userDetailsForAdminSerializer
 * @returns {Promise<*>}
 */
const getUserDetails = async function (request, h, dependencies = { userDetailsForAdminSerializer }) {
  const userId = request.params.id;
  const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
  return dependencies.userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
};

/**
 *
 * @param request
 * @param h
 * @param dependencies
 * @param {UserDetailsForAdminSerializer} dependencies.userDetailsForAdminSerializer
 * @returns {Promise<*>}
 */
const anonymizeUser = async function (request, h, dependencies = { userAnonymizedDetailsForAdminSerializer }) {
  const userToAnonymizeId = request.params.id;
  const adminMemberId = request.auth.credentials.userId;

  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.anonymizeUser({
      userId: userToAnonymizeId,
      updatedByUserId: adminMemberId,
      domainTransaction,
    });
  });

  const anonymizedUser = await usecases.getUserDetailsForAdmin({ userId: userToAnonymizeId });

  return h.response(dependencies.userAnonymizedDetailsForAdminSerializer.serialize(anonymizedUser)).code(200);
};

/**
 * @typedef {object} UserAdminController
 * @property {function} anonymizeUser
 * @property {function} findPaginatedFilteredUsers
 * @property {function} getUserDetails
 * @property {function} unblockUserAccount
 * @property {function} updateUserDetailsByAdmin
 */
const userAdminController = {
  anonymizeUser,
  findPaginatedFilteredUsers,
  getUserDetails,
  unblockUserAccount,
  updateUserDetailsByAdmin,
};

export { userAdminController };
