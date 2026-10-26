import { databaseBuffer } from '../database-buffer.ts';
import {
  attachCertificationCenterToOrganizationStructure,
  buildFactStructure,
  findFactStructureByCertificationCenterId,
} from './build-fact-structure.js';
import { buildStructure } from './build-structure.js';

const buildCertificationCenter = function ({
  id = databaseBuffer.getNextId(),
  name = 'some name',
  type = 'SUP',
  externalId = 'EX123',
  createdAt = new Date('2020-01-01'),
  createdBy = null,
  updatedAt,
  isScoBlockedAccessWhitelist = false,
  archivedAt = null,
  archivedBy = null,
  structureId = null,
  categoryId = null,
  organizationId = null,
  withoutStructure = false,
} = {}) {
  const values = {
    id,
    name,
    type,
    externalId,
    createdAt,
    createdBy,
    updatedAt,
    isScoBlockedAccessWhitelist,
    archivedAt,
    archivedBy,
  };
  const certificationCenter = databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });

  if (organizationId) {
    attachCertificationCenterToOrganizationStructure({ organizationId, certificationCenterId: id });
  } else if (!withoutStructure) {
    buildFactStructure({ structureId: structureId ?? buildStructure({ categoryId }).id, certificationCenterId: id });
  }

  return certificationCenter;
};

/**
 * Creates a certificationCenter with a structure attached (certif center + structure + fct_structure).
 *
 * @param {object} options
 * @param {object} [options.certificationCenterData] - Any parameter accepted by buildCertificationCenter
 * @param {number} [options.organizationId] - optional organization id to link to the certification center
 * @param {number} [options.categoryId] - optional categoryId for structure
 * @returns {{ certificationCenter: object, structure: object }}
 */
const buildCertificationCenterWithStructure = function ({
  certificationCenterData,
  organizationId,
  categoryId = null,
} = {}) {
  if (organizationId) {
    const certificationCenter = buildCertificationCenter({ ...certificationCenterData, organizationId });
    const { structure_id: structureId } = findFactStructureByCertificationCenterId(certificationCenter.id);
    return { certificationCenter, structure: { id: structureId } };
  }

  const structure = buildStructure({ categoryId });
  const certificationCenter = buildCertificationCenter({ ...certificationCenterData, structureId: structure.id });
  return { certificationCenter, structure };
};

export { buildCertificationCenter, buildCertificationCenterWithStructure };
