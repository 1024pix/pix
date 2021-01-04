const { knex } = require('../bookshelf');

async function findByCampaignId(campaignId) {
  const divisions = await knex('campaigns')
    .where({ 'campaigns.id ': campaignId })
    .select('division')
    .groupBy('division')
    .join('campaign-participations', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin('schooling-registrations', function() {
      this.on('schooling-registrations.userId', '=', 'campaign-participations.userId')
        .andOn('schooling-registrations.organizationId', '=', 'campaigns.organizationId');
    });

  return divisions.map(({ division }) => division);
}

module.exports = {
  findByCampaignId,
};
