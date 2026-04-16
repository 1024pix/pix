import { Knex } from 'knex';

import { createOrganizationLearnerInDb, createUserInDB } from '../../db-utils.ts';
import { pixCertifiableUserData } from '../data.ts';

export async function buildCertifiableUsers(knex: Knex, organizationId: number): Promise<void> {
  let userId = 1_000_000_000;
  for (const userData of pixCertifiableUserData) {
    const finalUserData = {
      ...userData,
      id: userId,
      email: `pix-app-user-${userId}-0@example.net`,
      cgu: true,
      pixCertifTermsOfServiceAccepted: true,
      mustValidateTermsOfService: false,
    };
    await createUserInDB(finalUserData, knex);

    await createOrganizationLearnerInDb(
      { organizationId, userId, firstName: finalUserData.firstName, lastName: finalUserData.lastName },
      knex,
    );

    userId++;
  }
}
