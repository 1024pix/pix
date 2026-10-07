/**
 * @typedef {import ('./index.js').OrganizationForAdminRepository} OrganizationForAdminRepository
 * @typedef {import ('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 */

import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UnableToAttachCertificationCenterToOrganization } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @param {number} params.certificationCenterId
 * @param {StructureRepository} params.structureRepository
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @returns {Promise<void>}
 */
export const attachCertificationCenterToOrganization = withTransaction(async function ({
  organizationId,
  certificationCenterId,
  certificationCenterForAdminRepository,
  structureRepository,
}) {
  const organizationStructure = await structureRepository.findByOrganizationId({ organizationId });
  if (!organizationStructure) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'ORGANIZATION_NOT_FOUND',
      message: 'Organization not found',
      meta: { organizationId },
    });
  }

  const certificationCenterStructure = await structureRepository.findByCertificationCenterId({ certificationCenterId });

  if (!certificationCenterStructure) {
    // TODO(PIX-24402): enlever cette vérif provisoire via le repo certificationCenterForAdmin afin de gérer les cas où les centres de certif n'ont pas encore de structure
    const existingCertificationCenter = await certificationCenterForAdminRepository.exists({ certificationCenterId });
    if (!existingCertificationCenter) {
      throw new UnableToAttachCertificationCenterToOrganization({
        code: 'NON_EXISTING_CERTIFICATION_CENTER',
        message: 'Unable to attach a non existing certification center.',
        meta: { organizationId, certificationCenterId },
      });
    }
  }

  organizationStructure.attachCertificationCenter({ certificationCenterId, certificationCenterStructure });

  if (certificationCenterStructure && !certificationCenterStructure.organizationId) {
    await structureRepository.deleteStructure({ structureId: certificationCenterStructure.id });
  }

  await structureRepository.save(organizationStructure);
});
