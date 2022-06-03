const buildTargetProfileTemplate = require('./build-target-profile-template');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfileTemplateTube({
  id = databaseBuffer.getNextId(),
  targetProfileTemplateId = buildTargetProfileTemplate().id,
  tubeId = 'tubeId1',
  level = 8,
} = {}) {
  const values = {
    id,
    targetProfileTemplateId,
    tubeId,
    level,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-templates_tubes',
    values,
  });
};
