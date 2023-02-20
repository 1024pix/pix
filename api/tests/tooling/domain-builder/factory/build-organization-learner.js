import OrganizationLearner from '../../../../lib/domain/models/OrganizationLearner';
import buildOrganization from './build-organization';

function buildOrganizationLearner({
  id = 123,
  organization = buildOrganization({ isManagingStudents: true }),
  lastName = 'India',
  preferredLastName = 'China',
  firstName = 'Korea',
  middleName = 'Japan',
  thirdName = 'Thailand',
  sex = 'F',
  birthdate = '2005-10-02',
  birthCity = 'Perpignan',
  birthCityCode = '1023',
  birthCountryCode = '100',
  birthProvinceCode = '66',
  MEFCode = 'SUPERMEF123',
  status = 'ST',
  nationalStudentId = null,
  division = 'B1',
  userId,
  isDisabled = false,
  updatedAt = new Date('2020-01-01'),
} = {}) {
  return new OrganizationLearner({
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
    updatedAt,
    userId,
    isDisabled,
    organizationId: organization.id,
  });
}

export default buildOrganizationLearner;
