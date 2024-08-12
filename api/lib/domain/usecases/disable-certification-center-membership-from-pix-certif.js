import { ForbiddenError } from '../../../src/shared/application/http-errors.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';

const disableCertificationCenterMembershipFromPixCertif = async function ({
  certificationCenterMembershipId,
  updatedByUserId,
  certificationCenterMembershipRepository,
}) {
  const membershipToDisable = await certificationCenterMembershipRepository.findById(certificationCenterMembershipId);

  if (!membershipToDisable) {
    throw new NotFoundError(`Cannot find a certification center membership for id ${certificationCenterMembershipId}`);
  }

  const membershipCanBeDisabled = await _membershipCanBeDisabled({
    membershipToDisable,
    certificationCenterMembershipRepository,
  });

  if (!membershipCanBeDisabled) {
    throw new ForbiddenError(`Cannot disable membership with id ${certificationCenterMembershipId}`);
  }

  membershipToDisable.disableMembership(updatedByUserId);

  certificationCenterMembershipRepository.update(membershipToDisable);
};

async function _membershipCanBeDisabled({ membershipToDisable, certificationCenterMembershipRepository }) {
  if (!membershipToDisable.hasAdminRole) {
    return true;
  }

  const currentActiveAdmins = await certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId(
    membershipToDisable.certificationCenter.id,
  );

  return currentActiveAdmins.length > 1;
}

export { disableCertificationCenterMembershipFromPixCertif };
