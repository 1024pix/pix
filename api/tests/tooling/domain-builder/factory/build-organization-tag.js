const faker = require('faker');
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');

module.exports = function buildOrganizationTag(
  {
    id = faker.random.number(),
    organizationId = faker.random.number(),
    tagId = faker.random.number(),
  } = {}) {
  return new OrganizationTag({ id, organizationId, tagId });
};
