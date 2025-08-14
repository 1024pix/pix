import * as injectedCertificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../shared/domain/models/CertificationCenterMembership.js';
import { certificationCenterMembershipRepository as injectedCertificationCenterMembershipRepository } from '../../infrastructure/repositories/certification-center-membership.repository.js';
import * as injectedMembershipRepository from '../../infrastructure/repositories/membership.repository.js';

const createCertificationCenterMembershipForScoOrganizationAdminMember = async function ({
  membership,
  membershipRepository = injectedMembershipRepository,
  certificationCenterRepository = injectedCertificationCenterRepository,
  certificationCenterMembershipRepository = injectedCertificationCenterMembershipRepository,
} = {}) {
  const existingOrganizationMembership = await membershipRepository.get(membership.id);

  if (!membership.isAdmin || !existingOrganizationMembership.organization.isScoAndHasExternalId) return;

  const existingCertificationCenter = await certificationCenterRepository.findByExternalId({
    externalId: existingOrganizationMembership.organization.externalId,
  });

  if (!existingCertificationCenter || existingCertificationCenter.archivedAt) return;

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

export { createCertificationCenterMembershipForScoOrganizationAdminMember };
