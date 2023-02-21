import Membership from '../../../lib/domain/models/Membership';
import OrganizationInvitation from '../../../lib/domain/models/OrganizationInvitation';
import { PIX_ADMIN } from '../../../lib/domain/constants';

const { ROLES: ROLES } = PIX_ADMIN;

import { DEFAULT_PASSWORD, PIX_ALL_ORGA_ID } from './users-builder';
import OidcIdentityProviders from '../../../lib/domain/constants/oidc-identity-providers';

const PRO_COMPANY_ID = 1;
const PRO_POLE_EMPLOI_ID = 4;
const PRO_CNAV_ID = 17;
const PRO_MED_NUM_ID = 5;
const PRO_ARCHIVED_ID = 15;
const PRO_LEARNER_ASSOCIATED_ID = 1200;

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
  const privateCompanyCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Gormadoc',
    lastName: 'Fleetfoot',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: privateCompanyCreator.id, role: ROLES.SUPER_ADMIN });

  const now = new Date();
  const organization = databaseBuilder.factory.buildOrganization({
    id: PRO_COMPANY_ID,
    type: 'PRO',
    name: 'Dragon & Co',
    logoUrl: require('../src/dragonAndCoBase64'),
    createdBy: privateCompanyCreator.id,
    credit: 100,
    externalId: null,
    provinceCode: null,
    email: null,
  });
  databaseBuilder.factory.buildDataProtectionOfficer.withOrganizationId({
    firstName: 'Ayako',
    lastName: 'Sora',
    email: 'ayako.sora@example.net',
    organizationId: organization.id,
    createdAt: now,
    updatedAt: now,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_COMPANY_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildMembership({
    userId: PIX_ALL_ORGA_ID,
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

  // learner associated
  const userAssociated = databaseBuilder.factory.buildUser.withRawPassword({
    id: PRO_LEARNER_ASSOCIATED_ID,
    firstName: 'learnerPro',
    lastName: 'Associated',
    email: 'learnerpro.associated@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    id: PRO_LEARNER_ASSOCIATED_ID,
    firstName: userAssociated.firstName,
    lastName: userAssociated.lastName,
    birthdate: '2005-03-28',
    organizationId: PRO_COMPANY_ID,
    userId: PRO_LEARNER_ASSOCIATED_ID,
  });

  /* POLE EMPLOI */
  const poleEmploiCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Paul',
    lastName: 'Emploi',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: poleEmploiCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: PRO_POLE_EMPLOI_ID,
    type: 'PRO',
    name: 'Pôle Emploi',
    externalId: null,
    provinceCode: null,
    email: null,
    createdBy: poleEmploiCreator.id,
    identityProviderForCampaigns: OidcIdentityProviders.POLE_EMPLOI.service.code,
  });
  databaseBuilder.factory.buildOrganizationTag({ organizationId: PRO_POLE_EMPLOI_ID, tagId: 4 });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_POLE_EMPLOI_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* CNAV */
  const cnavCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Timothy',
    lastName: 'Chaney',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: cnavCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: PRO_CNAV_ID,
    type: 'PRO',
    name: 'CNAV',
    externalId: null,
    provinceCode: null,
    email: null,
    createdBy: cnavCreator.id,
    identityProviderForCampaigns: OidcIdentityProviders.CNAV.service.code,
  });

  databaseBuilder.factory.buildMembership({
    userId: proUser1.id,
    organizationId: PRO_CNAV_ID,
    organizationRole: Membership.roles.ADMIN,
  });

  /* MEDIATION NUMERIQUE */
  const digitalMediationCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Fanchon',
    lastName: 'Ricard',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: digitalMediationCreator.id, role: ROLES.SUPER_ADMIN });

  databaseBuilder.factory.buildOrganization({
    id: PRO_MED_NUM_ID,
    type: 'PRO',
    name: 'Médiation Numérique',
    credit: 50,
    externalId: null,
    provinceCode: null,
    email: null,
    createdBy: digitalMediationCreator.id,
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
  const archivedCreator = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Sébastien',
    lastName: 'Rouleau',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });
  databaseBuilder.factory.buildPixAdminRole({ userId: archivedCreator.id, role: ROLES.SUPER_ADMIN });

  const archivedAt = new Date('2022-02-02');

  databaseBuilder.factory.buildOrganization({
    id: PRO_ARCHIVED_ID,
    type: 'PRO',
    name: 'Orga archivée',
    archivedAt,
    archivedBy: pixSuperAdmin.id,
    createdBy: archivedCreator.id,
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

export default {
  organizationsProBuilder,
  PRO_COMPANY_ID,
  PRO_POLE_EMPLOI_ID,
  PRO_CNAV_ID,
  PRO_MED_NUM_ID,
  PRO_LEARNER_ASSOCIATED_ID,
};
