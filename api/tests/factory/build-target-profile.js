const TargetProfile = require('../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({ name, isPublic, skills = [] } = {}) {
  return new TargetProfile({ name, isPublic, skills });
};
