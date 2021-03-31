const UserCompetence = require('../../../../lib/domain/models/UserCompetence');
const buildArea = require('./build-area');

module.exports = function buildUserCompetence({
  id = 'recUserComp',
  index = '1.1',
  name = 'name',
  area = buildArea(),
  pixScore = 42,
  estimatedLevel = 1,
} = {}) {
  return new UserCompetence({
    id,
    index,
    name,
    area,
    pixScore,
    estimatedLevel,
  });
};
