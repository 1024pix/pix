import * as membershipSerializer from '../../../shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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

const membershipAdminController = {
  findPaginatedFilteredMembershipsForAdmin,
};

export { membershipAdminController };
