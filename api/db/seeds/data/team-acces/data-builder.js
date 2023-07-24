import { buildBlockedUsers } from './build-blocked-users.js';
import { buildPixAdminRoles } from './build-pix-admin-roles.js';
import { buildTemporaryBlockedUsers } from './build-temporary-blocked-user.js';
import { buildUsers } from './build-users.js';

async function teamAccesDataBuilder({ databaseBuilder }) {
  buildPixAdminRoles(databaseBuilder);

  buildUsers(databaseBuilder);

  buildBlockedUsers(databaseBuilder);
  buildTemporaryBlockedUsers(databaseBuilder);
}

export { teamAccesDataBuilder };
