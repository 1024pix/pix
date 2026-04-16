import { Knex } from 'knex';

import { createUserInDB } from '../../db-utils.ts';
import { pixCertifiableUserData } from '../data.ts';

export async function buildCertifiableUsers(knex: Knex) {
  let userId = 1_000_000_000;
  for (const userData of pixCertifiableUserData) {
    const finalUserData = {
      ...userData,
      id: userId,
      email: `pix-app-user-${userId}-0@example.net`,
    };
    await createUserInDB(
      {
        ...finalUserData,
        cgu: true,
        pixCertifTermsOfServiceAccepted: true,
        mustValidateTermsOfService: false,
      },
      knex,
    );

    userId++;
  }

  return knex('users').whereILike('email', 'pix-app-user-%').orderBy('id');
}
