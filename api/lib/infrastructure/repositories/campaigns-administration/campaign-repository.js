import { knex } from '../../../../db/knex-database-connection';

export default {
  archiveCampaigns(campaignIds, userId) {
    return knex('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
      archivedBy: userId,
      archivedAt: new Date(),
    });
  },
};
