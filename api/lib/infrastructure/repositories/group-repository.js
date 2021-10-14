const Group = require('../../domain/models/Group');
const { knex } = require('../bookshelf');

async function findByCampaignId(campaignId) {
  const groups = await knex('campaigns')
    .where({ 'campaigns.id': campaignId })
    .select('group')
    .groupBy('group')
    .join('campaign-participations', 'campaigns.id', 'campaign-participations.campaignId')
    .join('schooling-registrations', function () {
      this.on('schooling-registrations.userId', '=', 'campaign-participations.userId').andOn(
        'schooling-registrations.organizationId',
        '=',
        'campaigns.organizationId'
      );
    });

  return groups.map(({ group }) => _toDomain(group));
}

async function findByOrganizationId({ organizationId }) {
  const groupRows = await knex('schooling-registrations')
    .distinct('group')
    .where({ organizationId, isDisabled: false })
    .whereNotNull('group')
    .orderBy('group', 'asc');

  return groupRows.map(({ group }) => _toDomain(group));
}

function _toDomain(group) {
  return new Group({ name: group });
}

module.exports = {
  findByCampaignId,
  findByOrganizationId,
};
