const Membership = require('../../../lib/domain/models/Membership');
const { DEFAULT_PASSWORD } = require('./users-builder');

module.exports = function organizationsSupBuilder({ databaseBuilder }) {
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

  const supOrganization = databaseBuilder.factory.buildOrganization({
    id: 2,
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
    organizationId: supOrganization.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: supUser2.id,
    organizationId: supOrganization.id,
    organizationRole: Membership.roles.MEMBER,
  });

  // unactive imported
  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: 'Joffrey',
    lastName: 'Baratheon',
    birthdate: '2000-02-28',
    organizationId: supOrganization.id,
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
    organizationId: supOrganization.id,
    userId: aryaStark.id,
    studentNumber: 'JAIMELESLEGUMES123',
  });

  // supernumerary with student number
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
    organizationId: supOrganization.id,
    userId: sansaStark.id,
    isSupernumerary: true,
    studentNumber: null,
  });

  // supernumerary without student number
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
    organizationId: supOrganization.id,
    userId: branStark.id,
    isSupernumerary: true,
    studentNumber: 'JAIMELESFECULENTS123',
  });
};
