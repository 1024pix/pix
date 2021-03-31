const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');

module.exports = function buildSchoolingRegistrationForAdmin({
  id = 123,
  firstName = 'Super',
  lastName = 'Yvette',
  birthdate = '1959-01-05',
  division = '3eme',
  organizationId = 456,
  organizationExternalId = 'externalId',
  organizationName = 'name',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-01'),
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
