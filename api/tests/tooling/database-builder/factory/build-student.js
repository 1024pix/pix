const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildStudent({
  id,
  firstName = faker.name.firstName(),
  preferredName = faker.name.lastName(),
  lastName = faker.name.lastName(),
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
  organizationId,
  userId,
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
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
    organizationId,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'students',
    values,
  });
};
