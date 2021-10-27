const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSkillSet({
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
    tableName: 'skill-sets',
    values,
  });
};
