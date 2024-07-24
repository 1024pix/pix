import * as membershipSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/membership.serializer.js';
import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases as srcUsecases } from '../../../src/team/domain/usecases/index.js';
import { usecases } from '../../domain/usecases/index.js';
import { BadRequestError } from '../http-errors.js';

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
  await srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember({ membership });

  return h.response(dependencies.membershipSerializer.serialize(updatedMembership));
};

const disable = async function (request, h) {
  const membershipId = request.params.id;
  const userId = requestResponseUtils.extractUserIdFromRequest(request);

  await usecases.disableMembership({ membershipId, userId });
  return h.response().code(204);
};

const disableOwnOrganizationMembership = async function (request, h) {
  const organizationId = request.payload.organizationId;
  const userId = requestResponseUtils.extractUserIdFromRequest(request);

  await usecases.disableOwnOrganizationMembership({ organizationId, userId });

  return h.response().code(204);
};

const membershipController = { update, disable, disableOwnOrganizationMembership };

export { membershipController };
