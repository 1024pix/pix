import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

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

const membershipController = { disable, disableOwnOrganizationMembership };

export { membershipController };
