const TargetProfile = require('../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({ name, isPublic, skills = [], organizationId } = {}) {
  return new TargetProfile({ name, isPublic, skills, organizationId });
};
