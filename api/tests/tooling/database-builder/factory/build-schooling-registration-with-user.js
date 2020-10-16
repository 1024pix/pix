const faker = require('faker');
const moment = require('moment');
const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSchoolingRegistrationWithUser({
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
  studentNumber = faker.random.alphaNumeric(11),
  nationalStudentId = faker.random.alphaNumeric(11),
  division = faker.random.alphaNumeric(2),
  organizationId,
  user,
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  const { id: userId } = buildUser(user);

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
    studentNumber,
    nationalStudentId,
    division,
    organizationId,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'schooling-registrations',
    values,
  });
};
