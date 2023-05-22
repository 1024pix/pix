import { PIX_SUPER_ADMIN_ID, PIX_SUPPORT_ID, PIX_METIER_ID, PIX_CERTIF_ID } from './users-builder.js';
import { PIX_ADMIN } from '../../../lib/domain/constants.js';

const { ROLES } = PIX_ADMIN;

const pixAdminRolesBuilder = function ({ databaseBuilder }) {
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPPORT_ID, role: ROLES.SUPPORT });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_METIER_ID, role: ROLES.METIER });
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_CERTIF_ID, role: ROLES.CERTIF });
};

export { pixAdminRolesBuilder };
