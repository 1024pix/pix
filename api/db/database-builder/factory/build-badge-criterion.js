const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const databaseBuffer = require('../database-buffer');

const buildBadgeCriterion = function ({
  id = databaseBuffer.getNextId(),
  scope = BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = 50,
  badgeId,
  skillSetIds = [],
  cappedTubes,
  name = null,
} = {}) {
  const values = {
    id,
    scope,
    threshold,
    badgeId,
    skillSetIds,
    cappedTubes,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badge-criteria',
    values,
  });
};

buildBadgeCriterion.scopeCampaignParticipation = function ({ id, threshold, badgeId, name } = {}) {
  return buildBadgeCriterion({
    id,
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold,
    badgeId,
    name,
    skillSetIds: [],
    cappedTubes: [],
  });
};

buildBadgeCriterion.scopeSkillSets = function ({ id, threshold, badgeId, skillSetIds } = {}) {
  return buildBadgeCriterion({
    id,
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold,
    badgeId,
    skillSetIds,
    cappedTubes: [],
  });
};

buildBadgeCriterion.scopeCappedTubes = function ({ id, threshold, badgeId, cappedTubes, name } = {}) {
  return buildBadgeCriterion({
    id,
    scope: BadgeCriterion.SCOPES.CAPPED_TUBES,
    threshold,
    badgeId,
    name,
    skillSetIds: [],
    cappedTubes,
  });
};

module.exports = buildBadgeCriterion;
