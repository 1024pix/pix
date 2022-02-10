const Membership = require('../../../lib/domain/models/Membership');
const { DEFAULT_PASSWORD } = require('./users-builder');
const SUP_UNIVERSITY_ID = 2;

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

  databaseBuilder.factory.buildOrganization({
    id: SUP_UNIVERSITY_ID,
    type: 'SUP',
    name: 'Université du Lion',
    isManagingStudents: true,
    canCollectProfiles: true,
    externalId: null,
    provinceCode: null,
    email: null,
    showSkills: true,
  });

  databaseBuilder.factory.buildMembership({
    userId: supUser1.id,
    organizationId: SUP_UNIVERSITY_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: supUser2.id,
    organizationId: SUP_UNIVERSITY_ID,
    organizationRole: Membership.roles.MEMBER,
  });

  // student not associated
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Studentsup',
    lastName: 'Free',
    birthdate: '2010-10-10',
    organizationId: SUP_UNIVERSITY_ID,
    userId: null,
    studentNumber: 'free1',
    group: 'L1',
    division: null,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
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
    firstName: 'Studentsup',
    lastName: 'Associated',
    email: 'studentsup.associated@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: studentAssociated.firstName,
    lastName: studentAssociated.lastName,
    birthdate: '2005-03-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: studentAssociated.id,
    studentNumber: 'associated1',
    group: 'L1',
    division: null,
  });

  // disabled student
  const studentDisabled = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Studentsup',
    lastName: 'Disabled',
    email: 'studentsup.disabled@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: studentDisabled.firstName,
    lastName: studentDisabled.lastName,
    birthdate: '2000-05-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: studentDisabled.id,
    studentNumber: 'disabled1',
    isDisabled: true,
  });
}

module.exports = {
  organizationsSupBuilder,
  SUP_UNIVERSITY_ID,
};
