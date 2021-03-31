const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const buildOrganization = require('./build-organization');

function buildSchoolingRegistration({
  id = 123,
  organization = buildOrganization({ isManagingStudents: true }),
  lastName = 'India',
  preferredLastName = 'China',
  firstName = 'Korea',
  middleName = 'Japan',
  thirdName = 'Thailand',
  birthdate = '2005-10-02',
  birthCity = 'Perpignan',
  birthCityCode = '1023',
  birthCountryCode = 'FR123',
  birthProvinceCode = '66',
  MEFCode = 'SUPERMEF123',
  status = 'ST',
  nationalStudentId = null,
  division = 'B1',
  updatedAt = new Date('2020-01-01'),
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
