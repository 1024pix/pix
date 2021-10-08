const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildBadgePartnerCompetence({
  id = databaseBuffer.getNextId(),
  name = 'name',
  skillIds = [],
  badgeId,
} = {}) {
  if (_.isEmpty(skillIds)) {
    skillIds = ['recABC123', 'recDEF456'];
  }

  const values = {
    id,
    name,
    skillIds,
    badgeId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'badge-partner-competences',
    values,
  });
};
