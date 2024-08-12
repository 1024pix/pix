import { BadRequestError, ForbiddenError } from '../../../src/shared/application/http-errors.js';
import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { getCertificationCenterId } from '../../infrastructure/repositories/certification-center-membership-repository.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';

const disableFromPixAdmin = async function (request, h, dependencies = { requestResponseUtils }) {
  const certificationCenterMembershipId = request.params.id;
  const pixAgentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  await usecases.disableCertificationCenterMembershipFromPixAdmin({
    certificationCenterMembershipId,
    updatedByUserId: pixAgentUserId,
  });
  return h.response().code(204);
};

const disableFromPixCertif = async function (request, h, dependencies = { requestResponseUtils }) {
  const certificationCenterMembershipId = request.params.certificationCenterMembershipId;
  const currentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  await usecases.disableCertificationCenterMembershipFromPixCertif({
    certificationCenterMembershipId,
    updatedByUserId: currentUserId,
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

const updateFromPixCertif = async function (
  request,
  h,
  dependencies = { requestResponseUtils, certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMembershipId = request.params.id;
  const certificationCenterMembership = dependencies.certificationCenterMembershipSerializer.deserialize(
    request.payload,
  );
  const currentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  const foundCertificationCenterId = await getCertificationCenterId(certificationCenterMembershipId);
  if (foundCertificationCenterId != certificationCenterId) {
    throw new ForbiddenError('Wrong certification center');
  }

  const updatedCertificationCenterMembership = await usecases.updateCertificationCenterMembership({
    certificationCenterMembershipId,
    role: certificationCenterMembership.role,
    updatedByUserId: currentUserId,
  });

  return h.response(
    dependencies.certificationCenterMembershipSerializer.serializeMembers(updatedCertificationCenterMembership),
  );
};

const certificationCenterMembershipController = {
  disableFromPixAdmin,
  disableFromPixCertif,
  updateFromPixAdmin,
  updateFromPixCertif,
};

export { certificationCenterMembershipController };
