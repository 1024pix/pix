import { knex } from '../../../../db/knex-database-connection.js';

const archiveCampaigns = function (campaignIds, userId) {
  return knex('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
    archivedBy: userId,
    archivedAt: new Date(),
  });
};

export { archiveCampaigns };
