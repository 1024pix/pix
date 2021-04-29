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

  // unactive imported
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Joffrey',
    lastName: 'Baratheon',
    birthdate: '2000-02-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: null,
    studentNumber: 'JAIMELESFRUITS123',
  });

  // active imported
  const aryaStark = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Arya',
    lastName: 'Stark',
    email: 'arya.stark@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: aryaStark.firstName,
    lastName: aryaStark.lastName,
    birthdate: '2005-03-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: aryaStark.id,
    studentNumber: 'JAIMELESLEGUMES123',
  });

  // with student number
  const sansaStark = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Sansa',
    lastName: 'Stark',
    email: 'sansa.stark@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: sansaStark.firstName,
    lastName: sansaStark.lastName,
    birthdate: '2000-05-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: sansaStark.id,
    studentNumber: 'JAIMELECHOCOLAT',
  });

  // with student number
  const branStark = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Bran',
    lastName: 'Stark',
    email: 'bran.stark@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: branStark.firstName,
    lastName: branStark.lastName,
    birthdate: '2000-05-28',
    organizationId: SUP_UNIVERSITY_ID,
    userId: branStark.id,
    studentNumber: 'JAIMELESFECULENTS123',
  });
}

module.exports = {
  organizationsSupBuilder,
  SUP_UNIVERSITY_ID,
};
