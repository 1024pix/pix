const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeCriterion({
  id,
  scope = BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = faker.random.number(),
  badgeId,
  partnerCompetenceIds = [],
} = {}) {

  const values = {
    id,
    scope,
    threshold,
    badgeId,
    partnerCompetenceIds,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badge-criteria',
    values,
  });
};
