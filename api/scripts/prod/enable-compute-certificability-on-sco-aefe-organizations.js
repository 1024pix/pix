import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { ORGANIZATION_FEATURE } from '../../src/shared/domain/constants.js';

async function enableComputeCertificabilityOnScoAefeOrganizations() {
  const organizationIds = (
    await knex('organizations')
      .select('organizations.id')
      .join('organization-tags', 'organization-tags.organizationId', 'organizations.id')
      .join('tags', function () {
        this.on('tags.id', 'organization-tags.tagId').onVal('tags.name', 'AEFE');
      })
      .where({
        type: 'SCO',
        isManagingStudents: false,
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
      await enableComputeCertificabilityOnScoAefeOrganizations();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { enableComputeCertificabilityOnScoAefeOrganizations };
