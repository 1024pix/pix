import * as certificationCenterMembershipSerializer from '../../../shared/infrastructure/serializers/jsonapi/certification-center-membership.serializer.js';
import { usecases } from '../../domain/usecases/index.js';

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

const certificationCenterMembershipController = {
  findCertificationCenterMemberships,
};
export { certificationCenterMembershipController };
