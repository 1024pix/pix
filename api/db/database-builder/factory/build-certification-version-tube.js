import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationVersion } from './build-certification-version.js';

export function buildCertificationVersionTube({ versionId, tubeId } = {}) {
  versionId = !versionId ? buildCertificationVersion().id : versionId;

  return databaseBuffer.pushInsertable({
    tableName: 'certification_versions_tubes',
    values: {
      version_id: versionId,
      tube_id: tubeId,
    },
  });
}
