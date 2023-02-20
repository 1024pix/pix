import BadgeCriterion from '../../../lib/domain/models/BadgeCriterion';
import databaseBuffer from '../database-buffer';

const buildBadgeCriterion = function ({
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

buildBadgeCriterion.scopeCampaignParticipation = function ({ id, threshold, badgeId } = {}) {
  return buildBadgeCriterion({
    id,
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold,
    badgeId,
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

buildBadgeCriterion.scopeCappedTubes = function ({ id, threshold, badgeId, cappedTubes } = {}) {
  return buildBadgeCriterion({
    id,
    scope: BadgeCriterion.SCOPES.CAPPED_TUBES,
    threshold,
    badgeId,
    skillSetIds: [],
    cappedTubes,
  });
};

export default buildBadgeCriterion;
