import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import { PIX_PUBLIC_TARGET_PROFILE_ID, REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { PIX_ORGA_ALL_ORGA_ID } from './build-organization-users.js';
import { SCO_ORGANIZATION_ID } from './constants.js';

export function buildScoOrganizations(databaseBuilder) {
  _buildCollegeTheNightWatchOrganization(databaseBuilder);
}

function _buildCollegeTheNightWatchOrganization(databaseBuilder) {
  const organization = databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Collège House of The Dragon',
    isManagingStudents: true,
    email: 'dragon.house@example.net',
    externalId: 'ACCESS_SCO',
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  databaseBuilder.factory.buildMembership({
    userId: PIX_ORGA_ALL_ORGA_ID,
    organizationId: organization.id,
    organizationRole: Membership.roles.ADMIN,
  });

  databaseBuilder.factory.buildCampaign({
    name: 'ACCES Sco - Collège - Campagne d’évaluation Badges',
    code: 'SCOBADGE1',
    type: 'ASSESSMENT',
    organizationId: organization.id,
    creatorId: PIX_ORGA_ALL_ORGA_ID,
    ownerId: PIX_ORGA_ALL_ORGA_ID,
    targetProfileId: PIX_PUBLIC_TARGET_PROFILE_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2023-07-27'),
  });
}
