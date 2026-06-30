import { BadRequestError } from '../../../shared/application/errors/http-errors.js';
import { membershipSerializer } from '../../../shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

const create = async function (request, h, dependencies = { membershipSerializer }) {
  const userId = request.payload.data.relationships.user.data.id;
  const organizationId = request.payload.data.relationships.organization.data.id;

  const membership = await usecases.createMembership({ userId, organizationId });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serializeForAdmin(membership)).created();
};

const disable = async function (request, h) {
  const membershipId = request.params.id;
  const userId = extractUserIdFromRequest(request);

  await usecases.disableMembership({ membershipId, userId });
  return h.response().code(204);
};

const disableOwnOrganizationMembership = async function (request, h) {
  const organizationId = request.payload.organizationId;
  const userId = extractUserIdFromRequest(request);

  await usecases.disableOwnOrganizationMembership({ organizationId, userId });

  return h.response().code(204);
};

const update = async function (request, h, dependencies = { membershipSerializer }) {
  const membershipId = request.params.id;
  const userId = extractUserIdFromRequest(request);
  const membership = dependencies.membershipSerializer.deserialize(request.payload);

  const membershipIdFromPayload = parseInt(membership.id);
  if (membershipId !== membershipIdFromPayload) {
    throw new BadRequestError();
  }
  membership.updatedByUserId = userId;

  const updatedMembership = await usecases.updateMembership({ membership });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serialize(updatedMembership));
};

const findPaginatedFilteredMemberships = async function (request) {
  const organizationId = request.params.id;
  const options = request.query;

  const { models: memberships, pagination } = await usecases.findPaginatedFilteredOrganizationMemberships({
    organizationId,
    filter: options.filter,
    page: options.page,
  });
  return membershipSerializer.serialize(memberships, pagination);
};

async function updateLastAccessedAt(request, h) {
  const userId = extractUserIdFromRequest(request);
  const membershipId = request.params.membershipId;

  await usecases.updateMembershipLastAccessedAt({
    userId,
    membershipId,
  });

  return h.response().code(204);
}

const membershipController = {
  create,
  disable,
  disableOwnOrganizationMembership,
  findPaginatedFilteredMemberships,
  update,
  updateLastAccessedAt,
};

export { membershipController };
