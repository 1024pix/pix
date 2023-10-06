// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/DEV/pages/2153512965/Cr+er+une+migration

// If your migrations target `answers` or `knowledge-elements`
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`

const engineeringUserId = process.env.ENGINEERING_USER_ID;

async function deleteSupOrganizationLearnersDisabled(
  deletedById,
  knexTransaction,
  dependencies = {
    _queryBuilderForDisabledSupLearners,
    _deleteDisabledLearners,
    _deleteCampaignParticipations,
  },
) {
  const supOrganizationLearnersDisabledIds = await dependencies._queryBuilderForDisabledSupLearners(knexTransaction);

  if (supOrganizationLearnersDisabledIds.length === 0) return;

  await dependencies._deleteCampaignParticipations(supOrganizationLearnersDisabledIds, deletedById, knexTransaction);
  await dependencies._deleteDisabledLearners(supOrganizationLearnersDisabledIds, deletedById, knexTransaction);
}

async function _deleteCampaignParticipations(supOrganizationLearnersDisabledIds, deletedById, knexTransaction) {
  await knexTransaction('campaign-participations')
    .whereIn('organizationLearnerId', supOrganizationLearnersDisabledIds)
    .update({ deletedAt: new Date(), deletedBy: deletedById });
}

async function _deleteDisabledLearners(supOrganizationLearnersDisabledIds, deletedById, knexTransaction) {
  await knexTransaction('organization-learners').whereIn('id', supOrganizationLearnersDisabledIds).update({
    deletedAt: new Date(),
    deletedBy: deletedById,
  });
}

function _queryBuilderForDisabledSupLearners(knexTransaction) {
  return knexTransaction('organization-learners')
    .join('organizations', 'organizations.id', 'organization-learners.organizationId')
    .where({
      'organizations.type': 'SUP',
      'organization-learners.isDisabled': true,
    })
    .whereNull('organization-learners.deletedBy')
    .pluck('organization-learners.id');
}

const up = async function (knex) {
  await knex.transaction(async (trx) => {
    await deleteSupOrganizationLearnersDisabled(engineeringUserId, trx);
  });
};

const down = async function () {
  // Do nothing, because it's impossible to rollback
};

export { up, down, deleteSupOrganizationLearnersDisabled };
