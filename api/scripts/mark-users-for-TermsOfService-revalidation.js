import * as url from 'node:url';

import { knex } from '../db/knex-database-connection.js';
import { executeScript } from './tooling/tooling.js';

async function markUsersRequiringTermsOfServiceValidationForRevalidation() {
  const subquery = knex.select('users.id').from('users').where({
    cgu: true,
  });

  const result = await knex
    .table('users')
    .update({ mustValidateTermsOfService: true })
    .whereIn('id', subquery)
    .returning('id');
  return result.map(({ id }) => id);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log(
    'Start updating "mustValidateTermsOfService" column for some records of users table, from false to true.',
  );

  const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();
  console.log(`Successfully updated ${updatedUserIds.length} records.`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();

export { markUsersRequiringTermsOfServiceValidationForRevalidation };
