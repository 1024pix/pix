import { databaseBuffer } from '../database-buffer.js';
import { buildFactStructure } from './build-fact-structure.js';
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
  return databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });
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
  const certificationCenter = buildCertificationCenter(certificationCenterData);
  const structure = buildStructure({ categoryId });
  buildFactStructure({ structureId: structure.id, organizationId, certificationCenterId: certificationCenter.id });
  return { certificationCenter, structure };
};

export { buildCertificationCenter, buildCertificationCenterWithStructure };
