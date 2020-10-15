const faker = require('faker');
const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');

module.exports = function buildSchoolingRegistrationForAdmin({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = faker.date.past(),
  division = faker.random.word(),
  organizationId = faker.random.number(),
  organizationExternalId = faker.random.word(),
  organizationName = faker.random.word(),
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
} = {}) {
  return new SchoolingRegistrationForAdmin({
    id,
    firstName,
    lastName,
    birthdate,
    division,
    organizationId,
    organizationExternalId,
    organizationName,
    createdAt,
    updatedAt,
  });
};
