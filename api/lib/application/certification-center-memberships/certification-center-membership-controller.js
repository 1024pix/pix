import { usecases } from '../../domain/usecases/index.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';
import { BadRequestError } from '../http-errors.js';

const disable = async function (request, h, dependencies = { requestResponseUtils }) {
  const certificationCenterMembershipId = request.params.id;
  const pixAgentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  await usecases.disableCertificationCenterMembership({
    certificationCenterMembershipId,
    updatedByUserId: pixAgentUserId,
  });
  return h.response().code(204);
};

const updateFromPixAdmin = async function (
  request,
  h,
  dependencies = { requestResponseUtils, certificationCenterMembershipSerializer },
) {
  const certificationCenterMembershipId = request.params.id;
  const certificationCenterMembership = dependencies.certificationCenterMembershipSerializer.deserialize(
    request.payload,
  );
  const pixAgentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  if (certificationCenterMembershipId !== certificationCenterMembership.id) {
    throw new BadRequestError();
  }

  const updatedCertificationCenterMembership = await usecases.updateCertificationCenterMembership({
    certificationCenterMembershipId,
    role: certificationCenterMembership.role,
    updatedByUserId: pixAgentUserId,
  });

  return h.response(
    dependencies.certificationCenterMembershipSerializer.serializeForAdmin(updatedCertificationCenterMembership),
  );
};

const certificationCenterMembershipController = { disable, updateFromPixAdmin };

export { certificationCenterMembershipController };
