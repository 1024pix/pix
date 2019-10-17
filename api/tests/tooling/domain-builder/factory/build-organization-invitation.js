const faker = require('faker');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

module.exports = function buildOrganizationInvitation({
  id = faker.random.number(),
  organizationId = faker.random.number(),
  organizationName = faker.company.companyName(),
  email = faker.internet.exampleEmail(),
  status = OrganizationInvitation.StatusType.PENDING,
  code = faker.random.alphaNumeric(10),
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
} = {}) {
  return new OrganizationInvitation({
    id,
    organizationId,
    organizationName,
    email,
    status,
    code,
    createdAt,
    updatedAt,
  });
};
