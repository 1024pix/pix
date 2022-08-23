const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');
const { DEFAULT_PASSWORD } = require('./users-builder');
const PRO_COMPANY_ID = 1;
const PRO_POLE_EMPLOI_ID = 4;
const PRO_CNAV_ID = 17;
const PRO_MED_NUM_ID = 5;
const PRO_ARCHIVED_ID = 15;

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
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });

  const proUser2 = databaseBuilder.factory.buildUser.withRawPassword({
    id: 3,
    firstName: 'Thorgo',
    lastName: 'Nudo',
    email: 'pro.member@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    lastPixOrgaTermsOfServiceValidatedAt: new Date(),
  });

  databaseBuilder.factory.buildOrganization({
    id: PRO_COMPANY_ID,
    type: 'PRO',
    name: 'Dragon & Co',
    logoUrl: require('../src/dragonAndCoBase64'),
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
    identityProviderForCampaigns: 'POLE_EMPLOI',
  });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: PRO_POLE_EMPLOI_ID, tagId: 4 });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_POLE_EMPLOI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* CNAV */
  databaseBuilder.factory.buildOrganization({
    id: PRO_CNAV_ID,
    type: 'PRO',
    name: 'CNAV',
    externalId: null,
    provinceCode: null,
    email: null,
    identityProviderForCampaigns: 'CNAV',
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_CNAV_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* MEDIATION NUMERIQUE */
  databaseBuilder.factory.buildOrganization({
    id: PRO_MED_NUM_ID,
    type: 'PRO',
    name: 'Médiation Numérique',
    credit: 50,
    externalId: null,
    provinceCode: null,
    email: null,
  });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: PRO_MED_NUM_ID, tagId: 7 });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_MED_NUM_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* ARCHIVÉE */
  const pixSuperAdmin = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Clément',
    lastName: 'Tine',
    email: 'pix.superuser@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  const membership1 = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Colette',
    lastName: 'Stérole',
    email: 'coco.role@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });
  const membership2 = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Mick',
    lastName: 'Émmaousse',
    email: 'mimi.lasouris@example.net',
    rawPassword: DEFAULT_PASSWORD,
  });

  const archivedAt = new Date('2022-02-02');

  databaseBuilder.factory.buildOrganization({
    id: PRO_ARCHIVED_ID,
    type: 'PRO',
    name: 'Orga archivée',
    archivedAt,
    archivedBy: pixSuperAdmin.id,
  });
  databaseBuilder.factory.buildMembership({
    userId: membership1.id,
    organizationId: PRO_ARCHIVED_ID,
    organizationRole: Membership.roles.ADMIN,
    disabledAt: archivedAt,
  });
  databaseBuilder.factory.buildMembership({
    userId: membership2.id,
    organizationId: PRO_ARCHIVED_ID,
    organizationRole: Membership.roles.MEMBER,
    disabledAt: archivedAt,
  });
}

module.exports = {
  organizationsProBuilder,
  PRO_COMPANY_ID,
  PRO_POLE_EMPLOI_ID,
  PRO_CNAV_ID,
  PRO_MED_NUM_ID,
};
