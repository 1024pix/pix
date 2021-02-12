
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');

module.exports = function buildOrganizationTag({
  id = 123,
  organizationId = 456,
  tagId = 789,
} = {}) {
  return new OrganizationTag({ id, organizationId, tagId });
};
