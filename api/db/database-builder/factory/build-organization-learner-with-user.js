import buildOrganization from './build-organization';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildOrganizationLearnerWithUser({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  preferredLastName = 'pref-last-name',
  lastName = 'last-name',
  middleName = 'Gontran',
  thirdName = 'Dorothée',
  birthdate = '2005-08-05',
  birthCity = 'Perpignan',
  birthCityCode = 'PERPICODE',
  birthCountryCode = '100',
  birthProvinceCode = '66',
  MEFCode = '45612312345',
  status = 'ST',
  studentNumber = null,
  nationalStudentId = null,
  division = '3eme',
  organizationId,
  user,
  updatedAt = new Date('2021-01-01'), // for BEGINNING_OF_THE_2020_SCHOOL_YEAR, can outdate very fast! ;)
  group = 'LB1',
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
    group,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learners',
    values,
  });
}
