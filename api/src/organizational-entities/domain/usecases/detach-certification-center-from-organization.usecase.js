/**
 * @typedef {import ('./index.js').StructureRepository} StructureRepository
 */

import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OrganizationNotFound } from '../errors.js';

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @param {StructureRepository} params.structureRepository
 * @returns {Promise<void>}
 */
export const detachCertificationCenterFromOrganization = withTransaction(async function ({
  organizationId,
  structureRepository,
}) {
  const organizationStructure = await structureRepository.findByOrganizationId({ organizationId });
  if (!organizationStructure) {
    throw new OrganizationNotFound({
      code: 'ORGANIZATION_NOT_FOUND',
      message: 'Organization does not exist',
      meta: { organizationId },
    });
  }

  const certificationCenterStructure = organizationStructure.detachCertificationCenter();
  if (!certificationCenterStructure) return;

  await structureRepository.save(organizationStructure);
  await structureRepository.save(certificationCenterStructure);
});
