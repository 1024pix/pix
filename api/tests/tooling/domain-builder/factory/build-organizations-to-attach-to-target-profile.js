const OrganizationsToAttachToTargetProfile = require('../../../../lib/domain/models/OrganizationsToAttachToTargetProfile');

module.exports = function buildOrganizationsToAttachToTargetProfile({ id = 123 } = {}) {
  return new OrganizationsToAttachToTargetProfile({
    id,
  });
};
