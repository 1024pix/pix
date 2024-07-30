import { BadRequestError } from '../../../shared/application/http-errors.js';
import * as membershipSerializer from '../../../shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

const create = async function (request, h, dependencies = { membershipSerializer }) {
  const userId = request.payload.data.relationships.user.data.id;
  const organizationId = request.payload.data.relationships.organization.data.id;

  const membership = await usecases.createMembership({ userId, organizationId });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serializeForAdmin(membership)).created();
};

const update = async function (request, h, dependencies = { requestResponseUtils, membershipSerializer }) {
  const membershipId = request.params.id;
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const membership = dependencies.membershipSerializer.deserialize(request.payload);
  // eslint-disable-next-line no-restricted-syntax
  const membershipIdFromPayload = parseInt(membership.id);
  if (membershipId !== membershipIdFromPayload) {
    throw new BadRequestError();
  }
  membership.updatedByUserId = userId;

  const updatedMembership = await usecases.updateMembership({ membership });
  await usecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serialize(updatedMembership));
};

const membershipController = { create, update };

export { membershipController };
