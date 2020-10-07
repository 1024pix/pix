const faker = require('faker');
const moment = require('moment');
const HigherSchoolingRegistration = require('../../../../lib/domain/models/HigherSchoolingRegistration');
const buildOrganization = require('./build-organization');

function buildSchoolingRegistration(
  {
    organization = buildOrganization({ isManagingStudents: true }),
    lastName = faker.name.lastName(),
    preferredLastName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    middleName = faker.name.firstName(),
    thirdName = faker.name.firstName(),
    birthdate = moment(faker.date.past(2, '2009-12-31')).format('YYYY-MM-DD'),
    studentNumber = faker.random.number().toString(),
    email = faker.internet.exampleEmail(),
    educationalTeam = faker.name.jobTitle(),
    department = faker.name.jobArea(),
    group = faker.random.alphaNumeric(3),
    diploma = faker.name.jobType(),
    studyScheme = faker.random.alphaNumeric(5),
    isSupernumerary = false,
  } = {}) {

  return new HigherSchoolingRegistration({
    firstName,
    middleName,
    thirdName,
    lastName,
    preferredLastName,
    studentNumber,
    email,
    birthdate,
    diploma,
    department,
    educationalTeam,
    group,
    studyScheme,
    organizationId: organization.id,
    isSupernumerary,
  });
}

module.exports = buildSchoolingRegistration;
