import { SCOPES } from '../../../src/shared/domain/models/BadgeDetails.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildBadge } from './build-badge.js';

const buildBadgeCriterion = function ({
  id = databaseBuffer.getNextId(),
  scope = SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = 50,
  badgeId = buildBadge().id,
  cappedTubes = null,
  name = null,
} = {}) {
  const values = {
    id,
    scope,
    threshold,
    badgeId,
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
    scope: SCOPES.CAMPAIGN_PARTICIPATION,
    threshold,
    badgeId,
    name,
    cappedTubes: null,
  });
};

buildBadgeCriterion.scopeCappedTubes = function ({ id, threshold, badgeId, cappedTubes, name } = {}) {
  return buildBadgeCriterion({
    id,
    scope: SCOPES.CAPPED_TUBES,
    threshold,
    badgeId,
    name,
    cappedTubes,
  });
};

export { buildBadgeCriterion };
