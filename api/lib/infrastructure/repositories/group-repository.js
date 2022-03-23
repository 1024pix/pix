const Group = require('../../domain/models/Group');
const { knex } = require('../bookshelf');

async function findByCampaignId(campaignId) {
  const groups = await knex('campaigns')
    .where({ 'campaigns.id': campaignId })
    .distinct('group')
    .whereNotNull('group')
    .orderBy('group', 'asc')
    .join('campaign-participations', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-learners', function () {
      this.on('organization-learners.userId', '=', 'campaign-participations.userId').andOn(
        'organization-learners.organizationId',
        '=',
        'campaigns.organizationId'
      );
    });

  return groups.map(({ group }) => _toDomain(group));
}

async function findByOrganizationId({ organizationId }) {
  const groupRows = await knex('organization-learners')
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
