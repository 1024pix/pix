const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildBadgePartnerCompetence({
  id,
  name = faker.random.word(),
  color = faker.random.word(),
  skillIds = [],
  badgeId,
} = {}) {

  if (_.isEmpty(skillIds)) {
    skillIds = [
      'recABC' + faker.random.number(),
      'recDEF' + faker.random.number(),
    ];
  }

  const values = {
    id,
    name,
    color,
    skillIds,
    badgeId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'badge-partner-competences',
    values,
  });
};
