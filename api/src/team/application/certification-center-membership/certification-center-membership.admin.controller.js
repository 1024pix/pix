import { BadRequestError } from '../../../shared/application/errors/http-errors.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { certificationCenterMembershipSerializer } from '../../../team/infrastructure/serializers/jsonapi/certification-center-membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const findCertificationCenterMembershipsByCertificationCenter = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
    certificationCenterId,
  });

  return dependencies.certificationCenterMembershipSerializer.serialize(certificationCenterMemberships);
};

const updateRole = async function (request, h, dependencies = { certificationCenterMembershipSerializer }) {
  const certificationCenterMembershipId = request.params.id;
  const certificationCenterMembership = dependencies.certificationCenterMembershipSerializer.deserialize(
    request.payload,
  );
  const pixAgentUserId = extractUserIdFromRequest(request);

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

const disableFromPixAdmin = async function (request, h) {
  const certificationCenterMembershipId = request.params.id;
  const pixAgentUserId = extractUserIdFromRequest(request);

  await usecases.disableCertificationCenterMembershipFromPixAdmin({
    certificationCenterMembershipId,
    updatedByUserId: pixAgentUserId,
  });
  return h.response().code(204);
};

const createCertificationCenterMembershipByEmail = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const { email } = request.payload;

  const certificationCenterMembership = await usecases.createCertificationCenterMembershipByEmail({
    certificationCenterId,
    email,
  });
  return h
    .response(dependencies.certificationCenterMembershipSerializer.serialize(certificationCenterMembership))
    .created();
};

const findCertificationCenterMembershipsByUser = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const userId = request.params.id;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByUser({
    userId,
  });
  return h.response(
    dependencies.certificationCenterMembershipSerializer.serializeForAdmin(certificationCenterMemberships),
  );
};

const certificationCenterMembershipAdminController = {
  findCertificationCenterMembershipsByCertificationCenter,
  updateRole,
  disableFromPixAdmin,
  createCertificationCenterMembershipByEmail,
  findCertificationCenterMembershipsByUser,
};

export { certificationCenterMembershipAdminController };
