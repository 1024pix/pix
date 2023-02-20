import SupOrganizationLearner from '../../../../lib/domain/models/SupOrganizationLearner';
import buildOrganization from './build-organization';

function buildSupOrganizationLearner({
  organization = buildOrganization({ isManagingStudents: true }),
  lastName = 'Hanin',
  preferredLastName = 'ninin',
  firstName = 'Roger',
  middleName = 'Huguette',
  thirdName = 'Tom',
  birthdate = '1985-01-01',
  studentNumber = 'ABC123',
  email = 'roger.hanin@example.net',
  educationalTeam = 'team',
  department = 'dpt',
  group = 'grp12',
  diploma = 'licence',
  studyScheme = 'sch23',
} = {}) {
  return new SupOrganizationLearner({
    firstName,
    middleName,
    thirdName,
    lastName,
    preferredLastName,
    studentNumber,
    email,
    birthdate,
    diploma,
    department,
    educationalTeam,
    group,
    studyScheme,
    organizationId: organization.id,
  });
}

export default buildSupOrganizationLearner;
