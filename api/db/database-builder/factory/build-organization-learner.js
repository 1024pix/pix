import { buildOrganization } from './build-organization.js';
import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildOrganizationLearner = function ({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  preferredLastName = 'pref-last-name',
  lastName = 'last-name',
  middleName = 'Gontran',
  thirdName = 'Dorothée',
  sex = 'M',
  birthdate = '2005-08-05',
  birthCity = 'Perpignan',
  birthCityCode = 'PERPICODE',
  birthCountryCode = '100',
  birthProvinceCode = '66',
  MEFCode = '45612312345',
  status = 'ST',
  nationalStudentId = null,
  division = '3eme',
  studentNumber = null,
  email = 'supermail@example.net',
  educationalTeam = 'Enseignants blonds',
  department = 'seine-et-troll',
  group = 'AB1',
  diploma = 'Licence',
  isDisabled = false,
  createdAt = new Date('2021-01-01'),
  updatedAt = new Date('2021-02-01'), // for BEGINNING_OF_THE_2020_SCHOOL_YEAR, can outdate very fast! ;)
  organizationId,
  userId,
  deletedBy = null,
  deletedAt = null,
  isCertifiable = null,
  certifiableAt = null,
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
    sex,
    birthdate,
    birthCity,
    birthCityCode,
    birthCountryCode,
    birthProvinceCode,
    MEFCode,
    status,
    nationalStudentId,
    division,
    studentNumber,
    email,
    educationalTeam,
    department,
    group,
    diploma,
    isDisabled,
    createdAt,
    updatedAt,
    organizationId,
    userId,
    deletedBy,
    deletedAt,
    isCertifiable,
    certifiableAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learners',
    values,
  });
};

export { buildOrganizationLearner };
