const UserCompetence = require('../../../../lib/domain/models/UserCompetence');
const buildArea = require('./build-area');

module.exports = function buildUserCompetence({
  id = 'recUserComp',
  index = '1.1',
  name = 'name',
  area = buildArea(),
  areaId = 'recArea',
  pixScore = 42,
  estimatedLevel = 1,
  skills = [],
} = {}) {
  return new UserCompetence({
    id,
    index,
    name,
    area,
    areaId,
    pixScore,
    estimatedLevel,
    skills,
  });
};
