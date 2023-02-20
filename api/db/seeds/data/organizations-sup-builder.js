import Membership from '../../../lib/domain/models/Membership';
import { PIX_ADMIN } from '../../../lib/domain/constants';

const {
  ROLES: ROLES
} = PIX_ADMIN;

import { DEFAULT_PASSWORD, PIX_ALL_ORGA_ID } from './users-builder';

const SUP_UNIVERSITY_ID = 2;
const SUP_STUDENT_ASSOCIATED_ID = 888;
const SUP_STUDENT_DISABLED_ID = 889;
const SUP_STUDENT_CERTIFIABLE = 999;

function organizationsSupBuilder({ databaseBuilder }) {
  const supUser1 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 7,
    firstName: 'Tyrion',
    lastName: 'Lannister',
    email: 'sup.admin@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });
  const supUser2 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 8,
    firstName: 'Jaime',
    lastName: 'Lannister',
    email: 'sup.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  const universityCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Talon',
    lastName: 'Maheu',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildPixAdminRole({ userId: universityCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: SUP_UNIVERSITY_ID,
    type: 'SUP',
    name: 'Université du Lion',
    isManagingStudents: true,
    externalId: null,
    provinceCode: null,
    email: null,
    showSkills: true,
    createdBy: universityCreator.id,
  });

  databaseBuilder.factory.buildMembership({
    userId: supUser1.id,
    organizationId: SUP_UNIVERSITY_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: PIX_ALL_ORGA_ID,
    organizationId: SUP_UNIVERSITY_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: supUser2.id,
    organizationId: SUP_UNIVERSITY_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  // student not associated
  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Studentsup',
    lastName: 'Free',
    birthdate: '2010-10-10',
    organizationId: SUP_UNIVERSITY_ID,
    userId: null,
    studentNumber: 'free1',
    group: 'L1',
    division: null,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Studentsup',
    lastName: 'Free2',
    birthdate: '2009-09-09',
    organizationId: SUP_UNIVERSITY_ID,
    userId: null,
    studentNumber: 'free2',
    group: 'L2',
    division: null,
  });

  // student associated
  const studentAssociated = databaseBuilder.factory.buildUser.withRawPassword({
    id: SUP_STUDENT_ASSOCIATED_ID,
    firstName: 'Studentsup',
    lastName: 'Associated',
    email: 'studentsup.associated@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SUP_STUDENT_ASSOCIATED_ID,
    firstName: studentAssociated.firstName,
    lastName: studentAssociated.lastName,
    birthdate: '2005-03-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: SUP_STUDENT_ASSOCIATED_ID,
    studentNumber: 'associated1',
    group: 'L1',
    division: null,
  });

  // student certifiable
  const studentCertfiable = databaseBuilder.factory.buildUser.withRawPassword({
    id: SUP_STUDENT_CERTIFIABLE,
    firstName: 'Certi',
    lastName: 'Fiable',
    email: 'certi.fiable@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SUP_STUDENT_CERTIFIABLE,
    firstName: studentCertfiable.firstName,
    lastName: studentCertfiable.lastName,
    birthdate: '2005-03-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: SUP_STUDENT_CERTIFIABLE,
    studentNumber: 'c3rt1f',
    group: 'L3',
    division: null,
  });

  // disabled student
  const studentDisabled = databaseBuilder.factory.buildUser.withRawPassword({
    id: SUP_STUDENT_DISABLED_ID,
    firstName: 'Studentsup',
    lastName: 'Disabled',
    email: 'studentsup.disabled@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: SUP_STUDENT_DISABLED_ID,
    firstName: studentDisabled.firstName,
    lastName: studentDisabled.lastName,
    birthdate: '2000-05-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: SUP_STUDENT_DISABLED_ID,
    studentNumber: 'disabled1',
    isDisabled: true,
  });
}

export default {
  organizationsSupBuilder,
  SUP_UNIVERSITY_ID,
  SUP_STUDENT_ASSOCIATED_ID,
  SUP_STUDENT_DISABLED_ID,
  SUP_STUDENT_CERTIFIABLE,

};
