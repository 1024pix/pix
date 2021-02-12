const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSchoolingRegistrationWithUser({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  preferredLastName = 'pref-last-name',
  lastName = 'last-name',
  middleName = 'Gontran',
  thirdName = 'Dorothée',
  birthdate = '2005-08-05',
  birthCity = 'Perpignan',
  birthCityCode = 'PERPICODE',
  birthCountryCode = 'FRCODE',
  birthProvinceCode = '66',
  MEFCode = '45612312345',
  status = 'ST',
  studentNumber = null,
  nationalStudentId = null,
  division = '3eme',
  organizationId,
  user,
  updatedAt = new Date('2021-01-01'), // for BEGINNING_OF_THE_2020_SCHOOL_YEAR, can outdate very fast! ;)
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
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'schooling-registrations',
    values,
  });
};
