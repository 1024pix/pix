const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeCriterion({
  id = databaseBuffer.getNextId(),
  scope = BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = 50,
  badgeId,
  skillSetIds = [],
  cappedTubes,
} = {}) {
  const values = {
    id,
    scope,
    threshold,
    badgeId,
    skillSetIds,
    cappedTubes,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badge-criteria',
    values,
  });
};
