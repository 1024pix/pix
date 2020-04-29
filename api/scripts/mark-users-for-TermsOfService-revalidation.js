const Bookshelf = require('../lib/infrastructure/bookshelf');
const ERROR_RETURN_CODE = 1;

async function markUsersRequiringTermsOfServiceValidationForRevalidation() {
  const subquery = Bookshelf.knex
    .select('users.id')
    .from('users')
    .where({
      'cgu': true,
    });

  return Bookshelf.knex
    .table('users')
    .update({ mustValidateTermsOfService: true })
    .whereIn('id', subquery)
    .returning('id');
}

async function main() {
  console.log('Start updating "mustValidateTermsOfService" column for some records of users table, from false to true.');

  try {
    const updatedUserIds = await markUsersRequiringTermsOfServiceValidationForRevalidation();
    console.log(`Successfully updated ${updatedUserIds.length} records.`);

    console.log('Done.');
  } catch (error) {
    console.error('\n', error);
    process.exit(ERROR_RETURN_CODE);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(ERROR_RETURN_CODE);
    }
  );
}

module.exports = {
  markUsersRequiringTermsOfServiceValidationForRevalidation
};
