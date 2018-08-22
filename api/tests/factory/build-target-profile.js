const TargetProfile = require('../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({ id, name, isPublic, skills = [], organizationId } = {}) {
  return new TargetProfile({ id, name, isPublic, skills, organizationId });
};
