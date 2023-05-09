import { buildTargetProfile } from './build-target-profile.js';
import { databaseBuffer } from '../database-buffer.js';

const buildTargetProfileTube = function ({
  id = databaseBuffer.getNextId(),
  targetProfileId = buildTargetProfile().id,
  tubeId = 'tubeId1',
  level = 8,
} = {}) {
  const values = {
    id,
    targetProfileId,
    tubeId,
    level,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile_tubes',
    values,
  });
};

export { buildTargetProfileTube };
