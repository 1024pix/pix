const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const { DEFAULT_PASSWORD } = require('./users-builder');

module.exports = function organizationsProBuilder({ databaseBuilder }) {

  /* PRIVATE COMPANY */
  const proUser1 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 2,
    firstName: 'Daenerys',
    lastName: 'Targaryen',
    email: 'pro.admin@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  const proUser2 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 3,
    firstName: 'Thorgo',
    lastName: 'Nudo',
    email: 'pro.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
  });

  const dragonAndCoCompany = databaseBuilder.factory.buildOrganization({
    id: 1,
    type: 'PRO',
    name: 'Dragon & Co',
    logoUrl: require('../src/dragonAndCoBase64'),
    canCollectProfiles: true,
    credit: 100,
    externalId: null,
    provinceCode: null,
    email: null,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: dragonAndCoCompany.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser2.id,
    organizationId: dragonAndCoCompany.id,
    organizationRole: Membership.roles.MEMBER,
  });

  const userInvited = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Viserys',
    lastName: 'Targaryen',
    email: 'pro.invited@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildOrganizationInvitation({
    email: userInvited.email,
    status: OrganizationInvitation.StatusType.PENDING,
    organizationId: dragonAndCoCompany.id,
  });

  /* POLE EMPLOI */
  const poleEmploi = databaseBuilder.factory.buildOrganization({
    id: 4,
    type: 'PRO',
    name: 'Pôle Emploi',
    externalId: null,
    provinceCode: null,
    email: null,
  });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: 4, tagId: 4 });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: poleEmploi.id,
    organizationRole: Membership.roles.ADMIN,
  });

  /* MEDIATION NUMERIQUE */
  const mednum = databaseBuilder.factory.buildOrganization({
    id: 5,
    type: 'PRO',
    name: 'Médiation Numérique',
    canCollectProfiles: true,
    credit: 50,
    externalId: null,
    provinceCode: null,
    email: null,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: mednum.id,
    organizationRole: Membership.roles.ADMIN,
  });
};
