import { usecases } from '../domain/usecases/index.js';
import { userDetailsForAdminSerializer } from '../infrastructure/serializers/jsonapi/user-details-for-admin.serializer.js';

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
 * @typedef {object} UserAdminController
 * @property {function} getUserDetails
 */
export const userAdminController = {
  getUserDetails,
};
