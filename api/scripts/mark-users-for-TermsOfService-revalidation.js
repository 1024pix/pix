import { knex, disconnect } from '../db/knex-database-connection';

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

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log(
    'Start updating "mustValidateTermsOfService" column for some records of users table, from false to true.'
  );

  const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();
  console.log(`Successfully updated ${updatedUserIds.length} records.`);

  console.log('Done.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  markUsersRequiringTermsOfServiceValidationForRevalidation,
};
