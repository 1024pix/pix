const { knex } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');
const chunk = require('lodash/chunk');

async function dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport(chunkSize = 10) {
  const allOrganizationIds = await knex('organizations').where({ isManagingStudents: true }).pluck('id');
  const organizationIdsChunks = chunk(allOrganizationIds, chunkSize);

  await bluebird.mapSeries(organizationIdsChunks, async (organizationIds) => {
    await knex('schooling-registrations')
      .update({ userId: null })
      .whereIn('organizationId', organizationIds)
      .where({ birthdate: null })
      .whereNotNull('userId');
  });
}

module.exports = {
  dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport,
};

if (require.main === module) {
  const chunkSize = process.argv[2];
  dissociateUserFromCreatedSchoolingRegistrationsForOrganizationsWithImport(chunkSize)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
