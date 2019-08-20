const faker = require('faker');
const Student = require('../../../../lib/domain/models/Student');
const buildOrganization = require('./build-organization');

module.exports = function buildStudent(
  {
    id = faker.random.number(),
    organization = buildOrganization({ isManagingStudents: true }),
    lastName = faker.name.lastName(),
    preferredName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    middleName = faker.name.firstName(),
    thirdName = faker.name.firstName(),
    birthdate = faker.date.past(2, '2009-12-31'),
    birthCity = faker.address.city(),
    birthCityCode = faker.address.zipCode(),
    birthCountryCode = faker.random.number(3).toString(),
    birthProvinceCode = faker.random.alphaNumeric(3),
    MEFCode = faker.random.number(11).toString(),
    status = 'AP',
    nationalId = faker.random.alphaNumeric(11),
    nationalStudentId = faker.random.alphaNumeric(11),
    schoolClass = faker.random.alphaNumeric(2),
  } = {}) {

  return new Student({
    id,
    lastName,
    preferredName,
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
    nationalId,
    nationalStudentId,
    schoolClass,
    organization,
  });
};
