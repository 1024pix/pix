import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {Object} params
 * @param {string} params.tubeId
 * @param {number} params.versionId
 */
const buildCertificationVersionTube = function ({ tubeId, versionId } = {}) {
  const values = {
    tube_id: tubeId,
    version_id: versionId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification_versions_tubes',
    values,
  });
};

export { buildCertificationVersionTube };
