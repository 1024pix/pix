import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationVersion } from './build-certification-version.js';

const buildCertificationVersionTube = function ({ versionId, tubeId = 'recTube123' } = {}) {
  versionId = !versionId ? buildCertificationVersion().id : versionId;

  return databaseBuffer.pushInsertable({
    tableName: 'certification_versions_tubes',
    values: {
      version_id: versionId,
      tube_id: tubeId,
    },
  });
};

export { buildCertificationVersionTube };
