import { ForbiddenError } from '../../../shared/application/errors/http-errors.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { certificationCenterMembershipSerializer } from '../../../team/infrastructure/serializers/jsonapi/certification-center-membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { certificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';

const disableFromPixCertif = async function (request, h) {
  const certificationCenterMembershipId = request.params.certificationCenterMembershipId;
  const currentUserId = extractUserIdFromRequest(request);

  await usecases.disableCertificationCenterMembershipFromPixCertif({
    certificationCenterMembershipId,
    updatedByUserId: currentUserId,
  });
  return h.response().code(204);
};

const findCertificationCenterMemberships = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
    certificationCenterId,
  });

  return dependencies.certificationCenterMembershipSerializer.serializeMembers(certificationCenterMemberships);
};

const updateFromPixCertif = async function (request, h, dependencies = { certificationCenterMembershipSerializer }) {
  const certificationCenterId = request.params.certificationCenterId;
  const certificationCenterMembershipId = request.params.id;
  const certificationCenterMembership = dependencies.certificationCenterMembershipSerializer.deserialize(
    request.payload,
  );
  const currentUserId = extractUserIdFromRequest(request);

  const foundCertificationCenterId = await certificationCenterMembershipRepository.getCertificationCenterId(
    certificationCenterMembershipId,
  );
  if (foundCertificationCenterId !== certificationCenterId) {
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

const updateReferer = async function (request, h) {
  const certificationCenterId = request.params.certificationCenterId;
  const { userId, isReferer } = request.payload.data.attributes;

  await usecases.updateCertificationCenterReferer({
    userId,
    certificationCenterId,
    isReferer,
  });
  return h.response().code(204);
};

const updateLastAccessedAt = async function (request, h) {
  const userId = extractUserIdFromRequest(request);
  const certificationCenterMembershipId = request.params.certificationCenterMembershipId;

  await usecases.updateCertificationCenterMembershipLastAccessedAt({
    userId,
    certificationCenterMembershipId,
  });

  return h.response().code(204);
};

const certificationCenterMembershipController = {
  disableFromPixCertif,
  findCertificationCenterMemberships,
  updateFromPixCertif,
  updateReferer,
  updateLastAccessedAt,
};
export { certificationCenterMembershipController };
