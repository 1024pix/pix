const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSchoolingRegistration({
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
  nationalStudentId = null,
  nationalApprenticeId = null,
  division = '3eme',
  studentNumber = null,
  email = 'supermail@example.net',
  educationalTeam = 'Enseignants blonds',
  department = 'seine-et-troll',
  group = 'AB1',
  diploma = 'Licence',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
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
