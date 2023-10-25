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

  if (!certificationCenterMembership) {
    return await certificationCenterMembershipRepository.create({
      certificationCenterId: existingCertificationCenter.id,
      role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
      userId: existingOrganizationMembership.user.id,
    });
  }

  if (certificationCenterMembership.hasAdminRole) return;

  certificationCenterMembership.updateRole({
    role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
    updatedByUserId: membership.updatedByUserId,
  });

  await certificationCenterMembershipRepository.update(certificationCenterMembership);
};

export { createCertificationCenterMembershipForScoOrganizationMember };
