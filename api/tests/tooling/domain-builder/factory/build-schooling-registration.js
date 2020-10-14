const faker = require('faker');
const moment = require('moment');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const buildOrganization = require('./build-organization');

function buildSchoolingRegistration(
  {
    id = faker.random.number(),
    organization = buildOrganization({ isManagingStudents: true }),
    lastName = faker.name.lastName(),
    preferredLastName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    middleName = faker.name.firstName(),
    thirdName = faker.name.firstName(),
    birthdate = moment(faker.date.past(2, '2009-12-31')).format('YYYY-MM-DD'),
    birthCity = faker.address.city(),
    birthCityCode = faker.address.zipCode(),
    birthCountryCode = faker.random.number(3).toString(),
    birthProvinceCode = faker.random.alphaNumeric(3),
    MEFCode = faker.random.number(11).toString(),
    status = 'ST',
    nationalStudentId = faker.random.alphaNumeric(11),
    division = faker.random.alphaNumeric(2),
    updatedAt = moment(faker.date.past()).format('YYYY-MM-DD'),
  } = {}) {

  return new SchoolingRegistration({
    id,
    lastName,
    preferredLastName,
    firstName,
    middleName,
    thirdName,
    birthdate,
    birthCity,
    birthCityCode,
    birthCountryCode,
    birthProvinceCode,
    MEFCode,
    status,
    nationalStudentId,
    division,
    updatedAt,
    organizationId: organization.id,
  });
}

module.exports = buildSchoolingRegistration;
