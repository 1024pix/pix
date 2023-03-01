const { knex } = require('../../../../db/knex-database-connection.js');
const StageCollection = require('../../../domain/models/user-campaign-results/StageCollection.js');

module.exports = {
  async findStageCollection({ campaignId }) {
    const stages = await knex('stages')
      .select('stages.*')
      .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
      .where('campaigns.id', campaignId)
      .orderBy(['stages.threshold', 'stages.level']);

    return new StageCollection({ campaignId, stages });
  },
};
