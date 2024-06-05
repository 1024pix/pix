import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { REAL_PIX_SUPER_ADMIN_ID } from '../common/constants.js';
import { ACCESS_SCO_BAUDELAIRE_EXTERNAL_ID } from './constants.js';

export function buildArchivedOrganizations(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    name: 'Organisation archivée',
    archivedAt: new Date('2023-08-04'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
  databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'Lycée Joséphine Baker',
    isManagingStudents: true,
    email: 'josephine.baker@example.net',
    externalId: ACCESS_SCO_BAUDELAIRE_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '13',
    identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    archivedAt: new Date('2023-08-04'),
  });
}
