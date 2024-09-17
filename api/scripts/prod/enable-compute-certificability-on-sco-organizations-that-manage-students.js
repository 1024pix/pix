import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { ORGANIZATION_FEATURE } from '../../src/shared/domain/constants.js';
import { main } from '../fill-campaign-participation-id-in-badge-acquisitions.js';
import { executeScript } from '../tooling/tooling.js';

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
      await executeScript({
        processArgvs: process.argv,
        scriptFn: enableComputeCertificabilityOnScoOrganizationsThatManageStudents,
      });
    } catch (error) {
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { enableComputeCertificabilityOnScoOrganizationsThatManageStudents };
