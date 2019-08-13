const faker = require('faker');
const Student = require('../../../../lib/domain/models/Student');
const buildOrganization = require('./build-organization');

module.exports = function buildStudent(
  {
    id = faker.random.number(),
    organization = buildOrganization({ isManagingStudents: true }),
    lastName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    birthdate = faker.date.past(2, '2009-12-31')
  } = {}) {

  return new Student({ id, organization, lastName, firstName, birthdate });
};
