const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeCriterion({
  id,
  scope = faker.random.word(),
  threshold = faker.random.number(),
  badgeId,
} = {}) {

  const values = {
    id,
    scope,
    threshold,
    badgeId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badge-criteria',
    values,
  });
};
