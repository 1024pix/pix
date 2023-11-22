import { T2, T3 } from '../../../../lib/domain/constants/organization-places-categories.js';
import { REAL_PIX_SUPER_ADMIN_ID } from '../common/common-builder.js';
import { PRO_ORGANIZATION_ID } from '../common/constants.js';
import dayjs from 'dayjs';

function _buildPlaceLotsForProOrganization(databaseBuilder) {
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_ORGANIZATION_ID,
    category: T3,
    createdAt: dayjs().subtract(1, 'year').toDate(),
    activationDate: dayjs().subtract(6, 'months').toDate(),
    expirationDate: dayjs().subtract(1, 'months').toDate(),
    reference: 'Devis1',
    count: 300,
  });
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_ORGANIZATION_ID,
    category: T3,
    createdAt: dayjs().subtract(1, 'year').toDate(),
    activationDate: dayjs().subtract(6, 'months').toDate(),
    expirationDate: dayjs().add(1, 'months').toDate(),
    reference: 'Devis2',
    count: 50,
    deletedAt: dayjs().subtract(1, 'months').toDate(),
    deletedBy: REAL_PIX_SUPER_ADMIN_ID,
  });
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_ORGANIZATION_ID,
    category: T3,
    createdAt: dayjs().subtract(1, 'year').toDate(),
    activationDate: dayjs().subtract(6, 'months').toDate(),
    expirationDate: dayjs().add(1, 'months').toDate(),
    reference: 'Devis3',
    count: 150,
  });
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_ORGANIZATION_ID,
    category: T2,
    createdAt: dayjs().subtract(1, 'year').toDate(),
    activationDate: dayjs().subtract(3, 'months').toDate(),
    expirationDate: dayjs().add(6, 'months').toDate(),
    reference: 'Devis4',
    count: 100,
  });
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_ORGANIZATION_ID,
    category: T3,
    createdAt: dayjs().subtract(1, 'year').toDate(),
    activationDate: dayjs().add(3, 'months').toDate(),
    expirationDate: dayjs().add(9, 'months').toDate(),
    reference: 'Devis5',
    count: 400,
  });
}

export function buildPlaceLots(databaseBuilder) {
  _buildPlaceLotsForProOrganization(databaseBuilder);
  return databaseBuilder.commit();
}
