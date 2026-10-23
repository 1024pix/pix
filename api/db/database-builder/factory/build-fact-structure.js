import { databaseBuffer } from '../database-buffer.js';

const buildFactStructure = function ({
  structureId,
  networkId,
  parentStructureId,
  childStructureId,
  organizationId,
  certificationCenterId,
} = {}) {
  const values = {
    structure_id: structureId,
    network_id: networkId,
    parent_structure_id: parentStructureId,
    child_structure_id: childStructureId,
    organization_id: organizationId,
    certification_center_id: certificationCenterId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'fct_structures',
    values,
  });
};

/**
 * Attaches a certification center to the structure already held by an organization, mirroring
 * createCertificationCenter: both entities share a single fct_structures row.
 *
 * @returns {number} the organization structure id
 */
const attachCertificationCenterToOrganizationStructure = function ({ organizationId, certificationCenterId }) {
  const organizationFactStructure = (databaseBuffer.objectsToInsert['fct_structures'] ?? []).find(
    (factStructure) => factStructure.organization_id === organizationId,
  );

  if (!organizationFactStructure) {
    throw new Error(
      `Impossible de rattacher le centre de certification ${certificationCenterId} : l'organisation ${organizationId} n'a pas de structure dans le buffer.`,
    );
  }

  if (organizationFactStructure.certification_center_id) {
    throw new Error(
      `Impossible de rattacher le centre de certification ${certificationCenterId} : l'organisation ${organizationId} est déjà rattachée au centre de certification ${organizationFactStructure.certification_center_id}.`,
    );
  }

  organizationFactStructure.certification_center_id = certificationCenterId;

  return organizationFactStructure.structure_id;
};

const findFactStructureByCertificationCenterId = function (certificationCenterId) {
  return (databaseBuffer.objectsToInsert['fct_structures'] ?? []).find(
    (factStructure) => factStructure.certification_center_id === certificationCenterId,
  );
};

export {
  attachCertificationCenterToOrganizationStructure,
  buildFactStructure,
  findFactStructureByCertificationCenterId,
};
