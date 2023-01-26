const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

module.exports = function buildUserCompetence({
  id = 'recUserComp',
  index = '1.1',
  name = 'name',
  areaId = 'recArea',
  pixScore = 42,
  estimatedLevel = 1,
  skills = [],
} = {}) {
  return new UserCompetence({
    id,
    index,
    name,
    areaId,
    pixScore,
    estimatedLevel,
    skills,
  });
};
