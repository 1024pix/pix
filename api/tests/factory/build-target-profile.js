const TargetProfile = require('../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({ skills = [] } = {}) {
  return TargetProfile.fromListOfSkill(skills);
};
