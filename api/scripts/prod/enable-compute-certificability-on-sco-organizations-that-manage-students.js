import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { ORGANIZATION_FEATURE } from '../../src/shared/domain/constants.js';

async function enableComputeCertificabilityOnScoOrganizationsThatManageStudents() {
  const organizationIds = (
    await knex('organizations').select('id').where({
      type: 'SCO',
      isManagingStudents: true,
    })
  ).map(({ id }) => id);

  const { id: featureId } = await knex('features')
    .select('id')
    .where({ key: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key })
    .first();

  await knex('organization-features')
    .insert(organizationIds.map((organizationId) => ({ organizationId, featureId })))
    .onConflict()
    .ignore();
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await enableComputeCertificabilityOnScoOrganizationsThatManageStudents();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { enableComputeCertificabilityOnScoOrganizationsThatManageStudents };
