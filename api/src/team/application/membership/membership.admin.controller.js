import { membershipSerializer } from '../../../shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { userOrganizationForAdminSerializer } from '../../infrastructure/serializers/jsonapi/user-organization-for-admin-serializer.js';

const findPaginatedFilteredMembershipsForAdmin = async function (request) {
  const organizationId = request.params.id;
  const options = request.query;

  const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
    organizationId,
    filter: options.filter,
    page: options.page,
  });
  return membershipSerializer.serializeForAdmin(memberships, pagination);
};

const findUserOrganizationsForAdmin = async function (
  request,
  h,
  dependencies = { userOrganizationForAdminSerializer },
) {
  const userId = request.params.id;
  const organizations = await usecases.findUserOrganizationsForAdmin({ userId });

  return h.response(dependencies.userOrganizationForAdminSerializer.serialize(organizations));
};

export const membershipAdminController = {
  findPaginatedFilteredMembershipsForAdmin,
  findUserOrganizationsForAdmin,
};
