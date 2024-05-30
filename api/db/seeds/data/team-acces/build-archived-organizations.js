import { REAL_PIX_SUPER_ADMIN_ID } from '../common/constants.js';

export function buildArchivedOrganizations(databaseBuilder) {
  databaseBuilder.factory.buildOrganization({
    name: 'Organisation archivée',
    archivedAt: new Date('2023-08-04'),
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
}
