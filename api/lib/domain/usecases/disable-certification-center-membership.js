import { NotFoundError } from '../errors.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../models/CertificationCenterMembership.js';
import { ForbiddenError } from '../../application/http-errors.js';

const disableCertificationCenterMembership = async function ({
  certificationCenterMembershipId,
  updatedByUserId,
  certificationCenterMembershipRepository,
}) {
  const certificationCenterMembership = await certificationCenterMembershipRepository.findById(
    certificationCenterMembershipId,
  );

  if (!certificationCenterMembership) {
    throw new NotFoundError(`Cannot find a certification center membership for id ${certificationCenterMembershipId}`);
  }

  const membershipCanBeDisabled = await _membershipCanBeDisabled({
    certificationCenterMembership,
    certificationCenterMembershipRepository,
  });

  if (!membershipCanBeDisabled) {
    throw new ForbiddenError(`Cannot disabled membership with id ${certificationCenterMembershipId}`);
  }

  certificationCenterMembership.disableMembership(updatedByUserId);

  certificationCenterMembershipRepository.update(certificationCenterMembership);
};

async function _membershipCanBeDisabled({ certificationCenterMembership, certificationCenterMembershipRepository }) {
  if (certificationCenterMembership.role === CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER) {
    return true;
  }

  const currentActiveAdmins = await certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId(
    certificationCenterMembership.certificationCenter?.id,
  );

  const activeAdminsLeftAfterDisablingCurrentUser = currentActiveAdmins.filter(
    (currentActiveAdmin) => currentActiveAdmin.user.id !== certificationCenterMembership.user?.id,
  );

  return activeAdminsLeftAfterDisablingCurrentUser.length > 0;
}

export { disableCertificationCenterMembership };
