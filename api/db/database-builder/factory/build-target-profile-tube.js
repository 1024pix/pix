const buildTargetProfile = require('./build-target-profile');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfileTube({
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
