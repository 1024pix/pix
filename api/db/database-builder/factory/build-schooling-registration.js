const faker = require('faker');
const moment = require('moment');
const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSchoolingRegistration({
  id,
  firstName = faker.name.firstName(),
  preferredLastName = faker.name.lastName(),
  lastName = faker.name.lastName(),
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
  nationalApprenticeId = null,
  division = faker.random.alphaNumeric(2),
  studentNumber = faker.random.number().toString(),
  email = faker.internet.exampleEmail(),
  educationalTeam = faker.name.jobTitle(),
  department = faker.name.jobArea(),
  group = faker.random.alphaNumeric(3),
  diploma = faker.name.jobType(),
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
  isSupernumerary = false,
  organizationId,
  userId,
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
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
    nationalApprenticeId,
    division,
    studentNumber,
    email,
    educationalTeam,
    department,
    group,
    diploma,
    createdAt,
    updatedAt,
    isSupernumerary,
    organizationId,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'schooling-registrations',
    values,
  });
};
