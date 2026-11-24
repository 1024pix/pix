import { databaseBuffer } from '../database-buffer.ts';
import { buildCertificationVersion } from './build-certification-version.js';
import { buildTargetProfile } from './build-target-profile.js';

export function buildTargetProfileVersion({ versionId, targetProfileId } = {}) {
  versionId = !versionId ? buildCertificationVersion().id : versionId;
  targetProfileId = !targetProfileId ? buildTargetProfile().id : targetProfileId;

  return databaseBuffer.pushInsertable({
    tableName: 'target_profile_version',
    values: {
      version_id: versionId,
      target_profile_id: targetProfileId,
    },
  });
}
