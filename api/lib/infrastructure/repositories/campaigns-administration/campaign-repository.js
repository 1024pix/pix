const { knex } = require('../../../../db/knex-database-connection');

module.exports = {
  archiveCampaigns(campaignIds, userId) {
    return knex('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
      archivedBy: userId,
      archivedAt: new Date(),
    });
  },
};
