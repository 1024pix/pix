import { usecases } from '../../domain/usecases/index.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';
import * as certificationCenterMemberSerializer from '../../infrastructure/serializers/jsonapi/certification-center-member-serializer.js';

const get = async function (request, h, dependencies = { requestResponseUtils, certificationCenterMemberSerializer }) {
  const certificationCenterId = request.query.certificationCenterId;
  const certificationCenterMembers = await usecases.getCertificationCenterMembersByCertificationCenter({
    certificationCenterId,
  });

  return h.response(dependencies.certificationCenterMemberSerializer.serialize(certificationCenterMembers));
};

const update = async function (
  request,
  h,
  dependencies = { certificationCenterMemberSerializer, requestResponseUtils },
) {
  const certificationCenterMemberId = request.params.certificationCenterMemberId;
  const certificationCenterMembership = dependencies.certificationCenterMemberSerializer.deserialize(request.payload);
  const currentUserId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  const updatedCertificationCenterMember = await usecases.updateCertificationCenterMember({
    certificationCenterMemberId,
    role: certificationCenterMembership.role,
    updatedByUserId: currentUserId,
  });

  return h.response(
    dependencies.certificationCenterMemberSerializer.serialize(updatedCertificationCenterMember),
  );
};

const certificationCenterMemberController = { get, update };

export { certificationCenterMemberController };
