import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../models/CertificationCenterMembership.js';

const createCertificationCenterMembershipForScoOrganizationMember = async function ({
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  const existingOrganizationMembership = await membershipRepository.get(membership.id);

  if (!membership.isAdmin || !existingOrganizationMembership.organization.isScoAndHasExternalId) return;

  const existingCertificationCenter = await certificationCenterRepository.findByExternalId({
    externalId: existingOrganizationMembership.organization.externalId,
  });

  if (!existingCertificationCenter) return;

  const certificationCenterMembership =
    await certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId({
      certificationCenterId: existingCertificationCenter.id,
      userId: existingOrganizationMembership.user.id,
    });

  if (certificationCenterMembership?.hasAdminRole) return;

  const membersCount = await certificationCenterMembershipRepository.countMembersForCertificationCenter(
    existingCertificationCenter.id,
  );
  const adminMembersCount = await certificationCenterMembershipRepository.countAdminMembersForCertificationCenter(
    existingCertificationCenter.id,
  );

  if (membersCount === 0) {
    return await _createCertificationCenterMembership({
      certificationCenterId: existingCertificationCenter.id,
      role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
      userId: existingOrganizationMembership.user.id,
      certificationCenterMembershipRepository,
    });
  }

  if (!certificationCenterMembership) {
    const role =
      adminMembersCount === 0
        ? CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN
        : CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER;
    return await _createCertificationCenterMembership({
      certificationCenterId: existingCertificationCenter.id,
      role,
      userId: existingOrganizationMembership.user.id,
      certificationCenterMembershipRepository,
    });
  }

  if (certificationCenterMembership.hasMemberRole && adminMembersCount > 0) return;

  certificationCenterMembership.updateRole({ role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN });

  await certificationCenterMembershipRepository.update(certificationCenterMembership);
};

const _createCertificationCenterMembership = async function ({
  certificationCenterId,
  role,
  userId,
  certificationCenterMembershipRepository,
}) {
  await certificationCenterMembershipRepository.create({
    certificationCenterId,
    role,
    userId,
  });
};

export { createCertificationCenterMembershipForScoOrganizationMember };
