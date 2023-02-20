import buildTargetProfile from './build-target-profile';
import databaseBuffer from '../database-buffer';

export default function buildTargetProfileTube({
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
}
