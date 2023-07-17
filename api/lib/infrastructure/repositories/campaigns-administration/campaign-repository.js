import { knex } from '../../../../db/knex-database-connection.js';

const archiveCampaigns = function (campaignIds, userId) {
  return knex('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
    archivedBy: userId,
    archivedAt: new Date(),
  });
};

const createCampaigns = function (campaignsToCreate) {
  return knex.batchInsert(
    'campaigns',
    campaignsToCreate.map((campaignToCreate) => ({
      ...campaignToCreate,
      createdAt: new Date(),
    })),
  );
};

export { archiveCampaigns, createCampaigns };
