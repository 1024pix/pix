import { PRO_COMPANY_ID } from './organizations-pro-builder';
import { PIX_SUPER_ADMIN_ID } from './users-builder';
function organizationPlacesProBuilder({ databaseBuilder }) {
  const activationDate = new Date();
  const expirationDate = new Date();
  const createdDate = new Date();

  // Deleted
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 40,
    activationDate: new Date(activationDate.setMonth(activationDate.getMonth() - 1)),
    expirationDate: new Date(expirationDate.setMonth(expirationDate.getMonth() + 8)),
    reference: 'TheOfficeDeleted',
    category: 'T1',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2019-12-01'),
    deletedBy: PIX_SUPER_ADMIN_ID,
    deletedAt: new Date('2020-01-12'),
  });

  // Expired
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 20,
    activationDate: new Date('2020-01-01'),
    expirationDate: new Date('2020-12-31'),
    reference: 'TheOfficeS02EP01',
    category: 'T1',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2019-12-01'),
  });

  // Expired
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 19,
    activationDate: new Date('2021-01-01'),
    expirationDate: new Date('2022-01-01'),
    reference: 'TheOfficeS02EP01',
    category: 'T0',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date('2019-12-25'),
  });

  // Active
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 700,
    activationDate: new Date(activationDate.setMonth(activationDate.getMonth() - 1)),
    expirationDate: new Date(expirationDate.setMonth(expirationDate.getMonth() + 8)),
    reference: 'TheOfficeS02EP02',
    category: 'T2',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date(createdDate.setMonth(createdDate.getMonth() - 2)),
  });

  // Active with same activationDate on another
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 45,
    activationDate: new Date(activationDate),
    expirationDate: new Date(expirationDate.setMonth(expirationDate.getMonth() + 2)),
    reference: 'TheOfficeS02EP03',
    category: 'T3',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date(createdDate),
  });

  // Active with same expired Date on another
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 77,
    activationDate: new Date(activationDate.setMonth(activationDate.getMonth() - 1)),
    expirationDate: new Date(expirationDate),
    reference: 'TheOfficeS02EP06',
    category: 'T2',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date(createdDate),
  });

  // Not Active Yet
  databaseBuilder.factory.buildOrganizationPlace({
    organizationId: PRO_COMPANY_ID,
    count: 700,
    activationDate: new Date(activationDate.setMonth(activationDate.getMonth() + 4)),
    reference: 'TheOfficeS02EP03',
    category: 'T2bis',
    createdBy: PIX_SUPER_ADMIN_ID,
    createdAt: new Date(createdDate.setMonth(createdDate.getMonth() - 2)),
  });
}

export default {
  organizationPlacesProBuilder,
};
