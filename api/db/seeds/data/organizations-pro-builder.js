const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const { DEFAULT_PASSWORD } = require('./users-builder');
const PRO_COMPANY_ID = 1;
const PRO_POLE_EMPLOI_ID = 4;
const PRO_MED_NUM_ID = 5;

function organizationsProBuilder({ databaseBuilder }) {

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

  databaseBuilder.factory.buildOrganization({
    id: PRO_COMPANY_ID,
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
    organizationId: PRO_COMPANY_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser2.id,
    organizationId: PRO_COMPANY_ID,
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
    organizationId: PRO_COMPANY_ID,
  });

  /* POLE EMPLOI */
  databaseBuilder.factory.buildOrganization({
    id: PRO_POLE_EMPLOI_ID,
    type: 'PRO',
    name: 'Pôle Emploi',
    externalId: null,
    provinceCode: null,
    email: null,
  });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: PRO_POLE_EMPLOI_ID, tagId: 4 });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_POLE_EMPLOI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* MEDIATION NUMERIQUE */
  databaseBuilder.factory.buildOrganization({
    id: PRO_MED_NUM_ID,
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
    organizationId: PRO_MED_NUM_ID,
    organizationRole: Membership.roles.ADMIN,
  });
}

module.exports = {
  organizationsProBuilder,
  PRO_COMPANY_ID,
  PRO_POLE_EMPLOI_ID,
  PRO_MED_NUM_ID,
};
