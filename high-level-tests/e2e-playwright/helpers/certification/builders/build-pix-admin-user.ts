import { Knex } from 'knex';

import { createUserInDB } from '../../db-utils.ts';
import { PixAdminUserData } from '../types.ts';

export async function buildPixAdminUser(knex: Knex, userData: PixAdminUserData) {
  const adminUserId = await createUserInDB(
    {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      rawPassword: userData.rawPassword,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
      id: userData.id,
    },
    knex,
  );
  await knex('pix-admin-roles').insert({ userId: adminUserId, role: userData.role });
  return adminUserId;
}
