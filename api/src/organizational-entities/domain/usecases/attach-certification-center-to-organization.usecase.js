/**
 * @typedef {import ('./index.js').OrganizationForAdminRepository} OrganizationForAdminRepository
 * @typedef {import ('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 */

import { UnableToAttachCertificationCenterToOrganization } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @param {number} params.certificationCenterId
 * @param {OrganizationForAdminRepository} params.organizationForAdminRepository
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @returns {Promise<void>}
 */
export const attachCertificationCenterToOrganization = async function ({
  organizationId,
  certificationCenterId,
  organizationForAdminRepository,
  certificationCenterForAdminRepository,
}) {
  const existingOrganization = await organizationForAdminRepository.exist({ organizationId });
  if (!existingOrganization) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'ORGANIZATION_NOT_FOUND',
      message: 'Organization not found',
      meta: { organizationId },
    });
  }

  const existingCertificationCenter = await certificationCenterForAdminRepository.exists({ certificationCenterId });

  if (!existingCertificationCenter) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'NON_EXISTING_CERTIFICATION_CENTER',
      message: 'Unable to attach a non existing certification center.',
      meta: { organizationId, certificationCenterId },
    });
  }

  const alreadyAttachedCertificationCenter =
    await certificationCenterForAdminRepository.findAttachedByOrganizationId(organizationId);

  if (alreadyAttachedCertificationCenter.length) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'ALREADY_ATTACHED_ORGANIZATION',
      message: 'Organization already has an attached certification center',
      meta: {
        organizationId,
        certificationCenterId,
        alreadyAttachedCertificationCenterId: alreadyAttachedCertificationCenter[0].id,
      },
    });
  }

  const alreadyAttachedOrganization = await organizationForAdminRepository.findAttachedByCertificationCenterId({
    certificationCenterId,
  });

  if (alreadyAttachedOrganization.length) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'ALREADY_ATTACHED_CERTIFICATION_CENTER',
      message: 'Unable to attach a certification center already attached to another organization.',
      meta: { organizationId, certificationCenterId, alreadyAttachedOrganizationId: alreadyAttachedOrganization[0].id },
    });
  }

  await organizationForAdminRepository.attachCertificationCenter({ organizationId, certificationCenterId });
};
