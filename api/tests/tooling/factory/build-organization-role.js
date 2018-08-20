const OrganizationRole = require('../../../lib/domain/models/OrganizationRole');

module.exports = function buildOrganizationRole({ id = 1, name = 'ORGA-MEMBER' } = {}) {
  return new OrganizationRole({ id, name });
};
