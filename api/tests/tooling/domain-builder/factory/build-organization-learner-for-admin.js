const SchoolingRegistrationForAdmin = require('../../../../lib/domain/read-models/SchoolingRegistrationForAdmin');

module.exports = function buildOrganizationLearnerForAdmin({
  id = 123,
  firstName = 'Super',
  lastName = 'Yvette',
  birthdate = '1959-01-05',
  division = '3eme',
  group = '4B',
  organizationId = 456,
  organizationName = 'name',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-01'),
  isDisabled = false,
  organizationIsManagingStudents = true,
} = {}) {
  return new SchoolingRegistrationForAdmin({
    id,
    firstName,
    lastName,
    birthdate,
    division,
    group,
    organizationId,
    organizationName,
    createdAt,
    updatedAt,
    isDisabled,
    organizationIsManagingStudents,
  });
};
